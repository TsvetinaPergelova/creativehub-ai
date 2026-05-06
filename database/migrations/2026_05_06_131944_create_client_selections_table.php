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
        Schema::create('client_selections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_share_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_asset_id')->constrained()->cascadeOnDelete();
            $table->string('session_id')->nullable();
            $table->string('client_name')->nullable();
            $table->boolean('is_favorite')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['project_share_id', 'project_asset_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_selections');
    }
};
