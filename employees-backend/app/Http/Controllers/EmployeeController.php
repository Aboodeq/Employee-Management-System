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
            'message' => __('messages.employees.created'),
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
            'message' => __('messages.employees.updated'),
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
            'message' => __('messages.employees.deleted'),
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
        return trans('messages.validation.filters');
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
        return trans('messages.validation.employee');
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
