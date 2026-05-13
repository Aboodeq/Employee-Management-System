<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (! Schema::hasColumn('employees', 'department_id')) {
                $table->foreignId('department_id')->nullable()->after('phone')->constrained()->nullOnDelete();
            }

            if (! Schema::hasColumn('employees', 'job_title_id')) {
                $table->foreignId('job_title_id')->nullable()->after('department_id')->constrained()->nullOnDelete();
            }
        });

        $now = now();
        $departmentId = DB::table('departments')->where('name', 'General')->value('id');

        if (! $departmentId) {
            $departmentId = DB::table('departments')->insertGetId([
                'name' => 'General',
                'name_ar' => 'عام',
                'description' => 'Default department for imported employee positions.',
                'is_active' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $positions = DB::table('employees')
            ->select('position')
            ->whereNotNull('position')
            ->distinct()
            ->pluck('position');

        foreach ($positions as $position) {
            $name = trim((string) $position) ?: 'Unassigned';
            $jobTitleId = DB::table('job_titles')
                ->where('department_id', $departmentId)
                ->where('name', $name)
                ->value('id');

            if (! $jobTitleId) {
                $jobTitleId = DB::table('job_titles')->insertGetId([
                    'department_id' => $departmentId,
                    'name' => $name,
                    'name_ar' => null,
                    'description' => null,
                    'is_active' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            DB::table('employees')
                ->where('position', $position)
                ->update([
                    'department_id' => $departmentId,
                    'job_title_id' => $jobTitleId,
                    'position' => $name,
                    'updated_at' => $now,
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            if (Schema::hasColumn('employees', 'job_title_id')) {
                $table->dropConstrainedForeignId('job_title_id');
            }

            if (Schema::hasColumn('employees', 'department_id')) {
                $table->dropConstrainedForeignId('department_id');
            }
        });
    }
};
