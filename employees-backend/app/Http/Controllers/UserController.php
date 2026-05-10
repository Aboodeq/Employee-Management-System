<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->latest()
            ->get()
            ->map(fn (User $user) => $this->serializeUser($user))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($this->userInput($request), $this->rules(), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $user = User::create($this->userData($validator->validated()));

        return response()->json([
            'success' => true,
            'message' => __('messages.users.created'),
            'data' => $this->serializeUser($user),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validator = Validator::make($this->userInput($request), $this->rules($user), $this->messages());

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $validated = $validator->validated();
        $newRole = Permissions::normalizeRole($validated['role'] ?? $user->role);

        if ($user->role === Permissions::ADMIN && $newRole !== Permissions::ADMIN && $this->isLastAdmin($user)) {
            return $this->lastAdminError();
        }

        $user->update($this->userData($validated));

        return response()->json([
            'success' => true,
            'message' => __('messages.users.updated'),
            'data' => $this->serializeUser($user->fresh()),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if ((int) $request->user()->id === (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => __('messages.users.cannot_delete_self'),
            ], 422);
        }

        if ($user->role === Permissions::ADMIN && $this->isLastAdmin($user)) {
            return $this->lastAdminError();
        }

        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.users.deleted'),
        ]);
    }

    private function rules(?User $user = null): array
    {
        $passwordRules = $user
            ? ['nullable', 'string', 'min:6', 'max:255']
            : ['required', 'string', 'min:6', 'max:255'];

        return [
            'name' => ['bail', 'required', 'string', 'min:2', 'max:120'],
            'username' => [
                'bail',
                'required',
                'string',
                'min:3',
                'max:60',
                'regex:/^[A-Za-z0-9_.-]+$/',
                Rule::unique('users', 'username')->ignore($user?->id),
            ],
            'email' => [
                'bail',
                'required',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($user?->id),
            ],
            'role' => ['required', Rule::in(Permissions::roles())],
            'password' => $passwordRules,
        ];
    }

    private function userInput(Request $request): array
    {
        $input = $request->all();

        foreach (['name', 'username', 'email', 'role'] as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = trim($input[$field]);
            }
        }

        if (isset($input['email']) && is_string($input['email'])) {
            $input['email'] = strtolower($input['email']);
        }

        if (isset($input['password']) && $input['password'] === '') {
            unset($input['password']);
        }

        return $input;
    }

    private function userData(array $validated): array
    {
        $data = [
            'name' => trim($validated['name']),
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
            'role' => Permissions::normalizeRole($validated['role'] ?? Permissions::VIEWER),
        ];

        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        return $data;
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'role' => Permissions::normalizeRole($user->role),
            'image' => $user->image,
            'permissions' => Permissions::forRole($user->role),
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }

    private function isLastAdmin(User $user): bool
    {
        return User::where('role', Permissions::ADMIN)->where('id', '!=', $user->id)->doesntExist();
    }

    private function lastAdminError(): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => __('messages.users.last_admin_required'),
        ], 422);
    }

    private function messages(): array
    {
        return trans('messages.validation.user');
    }

    private function validationError($validator): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }
}
