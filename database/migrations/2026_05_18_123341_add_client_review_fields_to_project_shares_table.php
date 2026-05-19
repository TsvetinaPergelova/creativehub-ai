<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_shares', function (Blueprint $table) {
            $table->string('reviewer_name')->nullable()->after('expires_at');
            $table->text('reviewer_comment')->nullable()->after('reviewer_name');
            $table->timestamp('approved_at')->nullable()->after('reviewer_comment');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_shares', function (Blueprint $table) {
            $table->dropColumn([
                'reviewer_name',
                'reviewer_comment',
                'approved_at',
            ]);
        });
    }
};
