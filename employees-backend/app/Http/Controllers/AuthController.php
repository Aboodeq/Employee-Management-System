<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], trans('messages.validation.auth'));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('username', $request->username)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => __('messages.auth.invalid_credentials'),
            ], 401);
        }

        $token = $user->createToken('frontend')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->serializeUser($user),
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'user' => $this->serializeUser($request->user()),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($this->profileInput($request), [
            'name' => ['bail', 'required', 'string', 'min:2', 'max:120'],
            'username' => [
                'bail',
                'required',
                'string',
                'min:3',
                'max:60',
                'regex:/^[A-Za-z0-9_.-]+$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'email' => [
                'bail',
                'required',
                'string',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => ['nullable', 'required_with:password', 'string'],
            'password' => ['nullable', 'string', 'min:6', 'max:255', 'confirmed'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_image' => ['nullable', 'boolean'],
        ], trans('messages.validation.profile'));

        if ($validator->fails()) {
            return $this->validationError($validator);
        }

        $validated = $validator->validated();

        if (! empty($validated['password']) && ! Hash::check($validated['current_password'] ?? '', $user->password)) {
            return response()->json([
                'success' => false,
                'errors' => [
                    'current_password' => [__('messages.profile.current_password_invalid')],
                ],
            ], 422);
        }

        $data = [
            'name' => trim($validated['name']),
            'username' => trim($validated['username']),
            'email' => strtolower(trim($validated['email'])),
        ];

        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }

        if ($request->boolean('remove_image') && $user->image) {
            Storage::disk('public')->delete($user->image);
            $data['image'] = null;
        }

        if ($request->hasFile('image')) {
            if ($user->image) {
                Storage::disk('public')->delete($user->image);
            }

            $data['image'] = $request->file('image')->store('users', 'public');
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => __('messages.profile.updated'),
            'user' => $this->serializeUser($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'success' => true,
            'message' => __('messages.auth.logged_out'),
        ]);
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

    private function profileInput(Request $request): array
    {
        $input = $request->all();

        foreach (['name', 'username', 'email'] as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                $input[$field] = trim($input[$field]);
            }
        }

        if (isset($input['email']) && is_string($input['email'])) {
            $input['email'] = strtolower($input['email']);
        }

        return $input;
    }

    private function validationError($validator): JsonResponse
    {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors(),
        ], 422);
    }
}
