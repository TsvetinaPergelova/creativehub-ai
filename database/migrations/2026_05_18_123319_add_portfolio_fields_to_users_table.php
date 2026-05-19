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
        Schema::table('users', function (Blueprint $table) {
            $table->string('specialization')->nullable()->after('name');
            $table->string('location')->nullable()->after('specialization');
            $table->text('bio')->nullable()->after('location');
            $table->string('website_url')->nullable()->after('bio');
            $table->string('instagram_url')->nullable()->after('website_url');
            $table->string('contact_email')->nullable()->after('instagram_url');
            $table->string('avatar_path')->nullable()->after('contact_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'specialization',
                'location',
                'bio',
                'website_url',
                'instagram_url',
                'contact_email',
                'avatar_path',
            ]);
        });
    }
};
