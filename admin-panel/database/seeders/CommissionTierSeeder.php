<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CommissionTier;

class CommissionTierSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            [
                'min_amount' => 100,
                'max_amount' => 5000,
                'percentage' => 1.5,
                'flat_fee' => 0,
                'applies_to' => 'milestone',
                'gateway' => null,
            ],
            [
                'min_amount' => 5001,
                'max_amount' => 10000,
                'percentage' => 1.3,
                'flat_fee' => 0,
                'applies_to' => 'milestone',
                'gateway' => null,
            ],
            [
                'min_amount' => 10001,
                'max_amount' => 20000,
                'percentage' => 1.0,
                'flat_fee' => 0,
                'applies_to' => 'milestone',
                'gateway' => null,
            ],
            [
                'min_amount' => 20001,
                'max_amount' => 50000,
                'percentage' => 0.8,
                'flat_fee' => 0,
                'applies_to' => 'milestone',
                'gateway' => null,
            ],
            [
                'min_amount' => 50001,
                'max_amount' => 100000,
                'percentage' => 0.5,
                'flat_fee' => 0,
                'applies_to' => 'milestone',
                'gateway' => null,
            ],
        ];

        foreach ($tiers as $tier) {
            CommissionTier::create($tier);
        }
    }
}
