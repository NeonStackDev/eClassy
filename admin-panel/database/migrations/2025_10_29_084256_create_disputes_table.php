<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disputes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // user who raised dispute
            $table->foreignId('order_id')->constrained()->onDelete('cascade'); // related order

            $table->text('description'); // details of dispute
            $table->string('issue'); // short issue title
            $table->string('proof')->nullable(); // file path
            $table->decimal('fixed_fee', 10, 2)->default(0);
            $table->enum('payment_status', ['pending', 'paid'])->default('pending'); 
            $table->enum('status', ['open', 'resolved', 'rejected'])->default('open');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disputes');
    }
};
