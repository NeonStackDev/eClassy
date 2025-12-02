<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;
    public function item()
    {
        return $this->belongsTo(Item::class, 'product_id'); // points to items table
    }
    public function buyer()
    {
        return $this->belongsTo(User::class, 'buyer_id');
    }
    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }
    public function disputes()
    {
        return $this->hasMany(Dispute::class);
    }

    public function scopeSearch($query, $search) {
        $search = "%" . $search . "%";
        $query = $query->where(function ($q) use ($search) {
            $q->orWhere('status', 'LIKE', $search)
                ->orWhere('created_at', 'LIKE', $search)
                ->orWhere('updated_at', 'LIKE', $search);
        });
        return $query;
    }

    public function scopeFilter($query, $filters)
    {
        foreach ($filters as $key => $value) {
            if (empty($value)) continue;
            switch ($key) {
                case 'status':
                    $query->where('status', $value);
                    break;
                    // Add more cases as needed
            }
        }

        return $query;
    }
}
