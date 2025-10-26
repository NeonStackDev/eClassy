<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_tiers', function (Blueprint $table) {
            $table->id();
            $table->decimal('min_amount', 12, 2);
            $table->decimal('max_amount', 12, 2);
            $table->decimal('percentage', 5, 2)->nullable();
            $table->decimal('flat_fee', 12, 2)->nullable();
            $table->enum('applies_to', ['deposit', 'withdraw', 'milestone'])->default('milestone');
            $table->string('gateway')->nullable(); // e.g., jazzcash_manual, easypaisa_auto, or null for global
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_tiers');
    }
};
