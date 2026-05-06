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
        Schema::create('project_asset_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_asset_id')->constrained()->cascadeOnDelete()->unique();
            $table->json('tags')->nullable();
            $table->text('alt_text')->nullable();
            $table->unsignedTinyInteger('composition_score')->nullable();
            $table->unsignedTinyInteger('focus_score')->nullable();
            $table->unsignedTinyInteger('lighting_score')->nullable();
            $table->text('critique')->nullable();
            $table->string('mood', 50)->nullable();
            $table->boolean('is_highlight')->default(false);
            $table->boolean('is_near_duplicate')->default(false);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['mood', 'is_highlight']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_asset_analyses');
    }
};
