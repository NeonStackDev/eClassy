<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BadgeApplication extends Model
{
    use HasFactory;
    public function badge() { return $this->belongsTo(Badge::class); }
    public function user() { return $this->belongsTo(User::class); }
}
