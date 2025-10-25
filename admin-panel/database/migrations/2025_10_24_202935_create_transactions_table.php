<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();

            // Who made this transaction
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Transaction type
            $table->enum('type', [
                'deposit',
                'withdrawal',
                'escrow_fund',
                'escrow_release',
                'refund',
                'admin_adjustment'
            ]);

            // Payment method: JazzCash, EasyPaisa, Bank, Wallet, etc.
            $table->string('method')->nullable();

            // For linking related entities
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type')->nullable(); // e.g., Order, Milestone

            // Amounts
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('fee', 12, 2)->default(0);
            $table->decimal('net_amount', 12, 2)->default(0); // amount - fee

            // Proof of payment (for manual deposits)
            $table->string('proof_image')->nullable();
            $table->string('transaction_ref')->nullable(); // Gateway reference or manual ID

            // Status: different depending on type
            $table->enum('status', [
                'pending',
                'approved',
                'rejected',
                'failed',
                'completed'
            ])->default('pending');

            $table->string('remarks')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
