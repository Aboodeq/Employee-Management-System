<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('job_titles')) {
            Schema::create('job_titles', function (Blueprint $table) {
                $table->id();
                $table->foreignId('department_id')->constrained()->cascadeOnDelete();
                $table->string('name');
                $table->string('name_ar')->nullable();
                $table->text('description')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
                $table->unique(['department_id', 'name']);
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('job_titles');
    }
};
