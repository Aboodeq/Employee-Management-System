<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filterValidator = Validator::make($request->query(), $this->filterRules(), $this->filterMessages());

        if ($filterValidator->fails()) {
            return $this->validationError($filterValidator);
        }

        $filters = $filterValidator->validated();
        $query = Employee::query()->latest();

        if ($this->filledFilter($filters, 'search')) {
            $search = trim($filters['search']);

            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        if ($this->filledFilter($filters, 'position')) {
            $query->where('position', $filters['position']);
        }

        if ($this->filledFilter($filters, 'salary_min')) {
            $query->where('salary', '>=', (float) $filters['salary_min']);
        }

        if ($this->filledFilter($filters, 'salary_max')) {
            $query->where('salary', '<=', (float) $filters['salary_max']);
        }

        if ($this->filledFilter($filters, 'hire_from')) {
            $query->whereDate('hire_date', '>=', $filters['hire_from']);
        }

        if ($this->filledFilter($filters, 'hire_to')) {
            $query->whereDate('hire_date', '<=', $filters['hire_to']);
        }

        if ($request->has('page') || $request->has('per_page') || $this->hasActiveFilters($filters)) {
            $perPage = min(max((int) $request->input('per_page', 12), 1), 50);
            $employees = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $employees->items(),
                'meta' => [
                    'current_page' => $employees->currentPage(),
                    'last_page' => $employees->lastPage(),
                    'per_page' => $employees->perPage(),
                    'total' => $employees->total(),
                    'from' => $employees->firstItem(),
                    'to' => $employees->lastItem(),
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function options(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'positions' => Employee::query()
                    ->select('position')
                    ->distinct()
                    ->orderBy('position')
                    ->pluck('position'),
                'salary_min' => Employee::min('salary'),
                'salary_max' => Employee::max('salary'),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($this->employeeInput($request), $this->rules(), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $data = $this->employeeData($validator->validated());

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('employees', 'public');
        }

        $employee = Employee::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Employee created successfully.',
            'data' => $employee,
        ], 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $employee,
        ]);
    }

    public function update(Request $request, Employee $employee): JsonResponse
    {
        $validator = Validator::make($this->employeeInput($request), $this->rules($employee), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $data = $this->employeeData($validator->validated());

        if ($request->boolean('remove_image') && $employee->image) {
            Storage::disk('public')->delete($employee->image);
            $data['image'] = null;
        }

        if ($request->hasFile('image')) {
            if ($employee->image) {
                Storage::disk('public')->delete($employee->image);
            }

            $data['image'] = $request->file('image')->store('employees', 'public');
        }

        $employee->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Employee updated successfully.',
            'data' => $employee->fresh(),
        ]);
    }

    public function destroy(Employee $employee): JsonResponse
    {
        if ($employee->image) {
            Storage::disk('public')->delete($employee->image);
        }

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Employee deleted successfully.',
        ]);
    }

    private function rules(?Employee $employee = null): array
    {
        return [
            'name' => ['bail', 'required', 'string', 'min:2', 'max:120', 'regex:/^[\pL\s\'.-]+$/u'],
            'email' => [
                'bail',
                'required',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employee?->id),
            ],
            'phone' => ['bail', 'required', 'string', 'regex:/^09[0-9]{8}$/'],
            'position' => ['bail', 'required', 'string', 'min:2', 'max:120', 'regex:/^[\pL\pN\s&+.,#\/()-]+$/u'],
            'salary' => ['bail', 'required', 'numeric', 'min:1', 'max:999999999.99'],
            'hire_date' => ['bail', 'required', 'date_format:Y-m-d', 'after_or_equal:1990-01-01', 'before_or_equal:today'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ];
    }

    private function filterRules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'position' => ['nullable', 'string', 'max:255'],
            'salary_min' => ['nullable', 'numeric', 'min:0'],
            'salary_max' => ['nullable', 'numeric', 'min:0'],
            'hire_from' => ['nullable', 'date'],
            'hire_to' => ['nullable', 'date'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    private function hasActiveFilters(array $filters): bool
    {
        foreach (['search', 'position', 'salary_min', 'salary_max', 'hire_from', 'hire_to'] as $filter) {
            if ($this->filledFilter($filters, $filter)) {
                return true;
            }
        }

        return false;
    }

    private function filledFilter(array $filters, string $key): bool
    {
        return array_key_exists($key, $filters) && $filters[$key] !== null && $filters[$key] !== '';
    }

    private function filterMessages(): array
    {
        return [
            'search.max' => 'كلمة البحث طويلة جداً',
            'position.max' => 'المسمى الوظيفي طويل جداً',
            'salary_min.numeric' => 'الحد الأدنى للراتب يجب أن يكون رقماً',
            'salary_min.min' => 'الحد الأدنى للراتب يجب ألا يكون سالباً',
            'salary_max.numeric' => 'الحد الأعلى للراتب يجب أن يكون رقماً',
            'salary_max.min' => 'الحد الأعلى للراتب يجب ألا يكون سالباً',
            'hire_from.date' => 'تاريخ البداية غير صحيح',
            'hire_to.date' => 'تاريخ النهاية غير صحيح',
            'page.integer' => 'رقم الصفحة غير صحيح',
            'page.min' => 'رقم الصفحة غير صحيح',
            'per_page.integer' => 'عدد العناصر في الصفحة غير صحيح',
            'per_page.min' => 'عدد العناصر في الصفحة غير صحيح',
            'per_page.max' => 'لا يمكن عرض أكثر من 50 موظفاً في الصفحة',
        ];
    }

    private function employeeInput(Request $request): array
    {
        $input = $request->all();

        foreach (['name', 'email', 'phone', 'position', 'salary', 'hire_date'] as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = trim($input[$field]);
            }
        }

        if (isset($input['email']) && is_string($input['email'])) {
            $input['email'] = strtolower($input['email']);
        }

        return $input;
    }

    private function messages(): array
    {
        return [
            'name.required' => 'الاسم الكامل مطلوب',
            'name.min' => 'الاسم يجب أن يحتوي على حرفين على الأقل',
            'name.max' => 'الاسم يجب ألا يتجاوز 120 حرفاً',
            'name.regex' => 'الاسم يجب أن يحتوي على أحرف ومسافات فقط',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.max' => 'البريد الإلكتروني طويل جداً',
            'email.unique' => 'هذا البريد الإلكتروني مستخدم مسبقاً',
            'phone.required' => 'رقم الهاتف مطلوب',
            'phone.regex' => 'رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام فقط',
            'position.required' => 'المسمى الوظيفي مطلوب',
            'position.min' => 'المسمى الوظيفي قصير جداً',
            'position.max' => 'المسمى الوظيفي يجب ألا يتجاوز 120 حرفاً',
            'position.regex' => 'المسمى الوظيفي يحتوي على رموز غير مسموحة',
            'salary.required' => 'الراتب مطلوب',
            'salary.numeric' => 'الراتب يجب أن يكون رقماً',
            'salary.min' => 'الراتب يجب أن يكون أكبر من صفر',
            'salary.max' => 'الراتب كبير جداً',
            'hire_date.required' => 'تاريخ التعيين مطلوب',
            'hire_date.date_format' => 'تاريخ التعيين يجب أن يكون بصيغة صحيحة',
            'hire_date.after_or_equal' => 'تاريخ التعيين قديم جداً',
            'hire_date.before_or_equal' => 'تاريخ التعيين لا يمكن أن يكون في المستقبل',
            'image.image' => 'الملف المختار يجب أن يكون صورة',
            'image.mimes' => 'الصورة يجب أن تكون JPG أو PNG أو WEBP',
            'image.max' => 'حجم الصورة يجب ألا يتجاوز 2MB',
        ];
    }

    private function employeeData(array $validated): array
    {
        unset($validated['image'], $validated['remove_image']);

        return $validated;
    }

    private function validationError($validator): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }
}
