<?php

namespace App\Http\Controllers;

use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Department::query()
            ->withCount(['employees', 'jobTitles'])
            ->with(['jobTitles' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name');

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($this->input($request), $this->rules(), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $department = Department::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.departments.created'),
            'data' => $department->loadCount(['employees', 'jobTitles']),
        ], 201);
    }

    public function update(Request $request, Department $department): JsonResponse
    {
        $validator = Validator::make($this->input($request), $this->rules($department), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $department->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.departments.updated'),
            'data' => $department->fresh()->loadCount(['employees', 'jobTitles']),
        ]);
    }

    public function destroy(Department $department): JsonResponse
    {
        $hasEmployees = $department->employees()->exists()
            || $department->jobTitles()->whereHas('employees')->exists();

        if ($hasEmployees) {
            return response()->json([
                'success' => false,
                'message' => __('messages.organization.departments.cannot_delete_in_use'),
            ], 422);
        }

        $department->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.departments.deleted'),
        ]);
    }

    private function rules(?Department $department = null): array
    {
        return [
            'name' => [
                'bail',
                'required',
                'string',
                'min:2',
                'max:120',
                Rule::unique('departments', 'name')->ignore($department?->id),
            ],
            'name_ar' => ['nullable', 'string', 'min:2', 'max:120'],
            'description' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    private function input(Request $request): array
    {
        $input = $request->all();

        foreach (['name', 'name_ar', 'description'] as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = trim($input[$field]);
            }
        }

        if (! array_key_exists('is_active', $input)) {
            $input['is_active'] = true;
        }

        return $input;
    }

    private function messages(): array
    {
        return trans('messages.validation.department');
    }

    private function validationError($validator): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }
}
