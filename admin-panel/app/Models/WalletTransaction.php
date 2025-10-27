<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use HasFactory;

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    /**
     * Apply filters dynamically
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFilter($query, $filters)
    {
        foreach ($filters as $key => $value) {
            if (empty($value)) continue;

            switch ($key) {
                case 'status':
                    $query->where('status', $value);
                    break;

                case 'mode':
                    $query->where('mode', $value);
                    break;

                case 'type':
                    $query->where('type', $value);
                    break;

                case 'min_amount':
                    $query->where('amount', '>=', $value);
                    break;

                case 'max_amount':
                    $query->where('amount', '<=', $value);
                    break;

                case 'user_name':
                    // filter by related user name
                    $query->whereHas('wallet.user', function ($q) use ($value) {
                        $q->where('name', 'like', "%{$value}%");
                    });
                    break;

                    // Add more cases as needed
            }
        }

        return $query;
    }
}
