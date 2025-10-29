<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommissionTier extends Model
{
    protected $fillable = [
        'min_amount',
        'max_amount',
        'percentage',
        'flat_fee',
        'applies_to',
        'gateway',
        'active',
    ];

    // helper: calculate fee for amount
    public static function calculateFee($amount, $type = 'milestone', $gateway = null)
    {
        $tier = self::where('applies_to', $type)
            ->where('active', true)
            ->where(function ($q) use ($gateway) {
                $q->where('gateway', $gateway)
                  ->orWhereNull('gateway');
            })
            ->where('min_amount', '<=', $amount)
            ->where('max_amount', '>=', $amount)
            ->orderByDesc('gateway')
            ->first();

        if (!$tier) return 0;

        $fee = 0;
        if ($tier->percentage) {
            $fee += ($amount * $tier->percentage) / 100;
        }
        if ($tier->flat_fee) {
            $fee += $tier->flat_fee;
        }

        return round($fee, 3);
    }
}
