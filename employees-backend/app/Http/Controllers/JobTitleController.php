<?php

namespace App\Http\Controllers;

use App\Models\JobTitle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class JobTitleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JobTitle::query()
            ->with('department')
            ->withCount('employees')
            ->orderBy('name');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true)
                ->whereHas('department', fn ($q) => $q->where('is_active', true));
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

        $jobTitle = JobTitle::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.job_titles.created'),
            'data' => $jobTitle->load('department')->loadCount('employees'),
        ], 201);
    }

    public function update(Request $request, JobTitle $jobTitle): JsonResponse
    {
        $validator = Validator::make($this->input($request), $this->rules($jobTitle), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $jobTitle->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.job_titles.updated'),
            'data' => $jobTitle->fresh()->load('department')->loadCount('employees'),
        ]);
    }

    public function destroy(JobTitle $jobTitle): JsonResponse
    {
        if ($jobTitle->employees()->exists()) {
            return response()->json([
                'success' => false,
                'message' => __('messages.organization.job_titles.cannot_delete_in_use'),
            ], 422);
        }

        $jobTitle->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.organization.job_titles.deleted'),
        ]);
    }

    private function rules(?JobTitle $jobTitle = null): array
    {
        return [
            'department_id' => ['bail', 'required', 'integer', 'exists:departments,id'],
            'name' => [
                'bail',
                'required',
                'string',
                'min:2',
                'max:120',
                Rule::unique('job_titles', 'name')
                    ->where(fn ($query) => $query->where('department_id', request('department_id')))
                    ->ignore($jobTitle?->id),
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
        return trans('messages.validation.job_title');
    }

    private function validationError($validator): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }
}
