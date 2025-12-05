<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisputeContent extends Model
{
    protected $fillable = [
        'dispute_id',
        'user_id',
        'message',
    ];

    public function dispute()
    {
        return $this->belongsTo(Dispute::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}