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
        Schema::create('dispute_contents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('dispute_id');     // link to disputes table
            $table->unsignedBigInteger('user_id');        // who wrote the message
            $table->text('message');                      // discussion text
            $table->string('attachment');                      // discussion text
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dispute_contents');
    }
};
