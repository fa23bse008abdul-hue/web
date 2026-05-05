<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\UserRegistration;

class UserRegistrationController extends Controller
{
    public function index()
    {
        $users = UserRegistration::all();
        return view('index', compact('users'));
    }

    public function create()
    {
        return view('create');
    }

    public function store(Request $request)
    {
        $imageName = null;

        if($request->hasFile('profile_picture')){
            $imageName = time().'.'.$request->profile_picture->extension();
            $request->profile_picture->move(public_path('uploads'), $imageName);
        }

        UserRegistration::create([
            'name' => $request->name,
            'email' => $request->email,
            'cnic' => $request->cnic,
            'telephone' => $request->telephone,
            'comments' => $request->comments,
            'profile_picture' => $imageName
        ]);

        return redirect('/');
    }

    public function edit($id)
    {
        $user = UserRegistration::find($id);
        return view('edit', compact('user'));
    }

    public function update(Request $request, $id)
    {
        $user = UserRegistration::find($id);

        if($request->hasFile('profile_picture')){
            $imageName = time().'.'.$request->profile_picture->extension();
            $request->profile_picture->move(public_path('uploads'), $imageName);
            $user->profile_picture = $imageName;
        }

        $user->update($request->except('profile_picture'));

        return redirect('/');
    }

    public function destroy($id)
    {
        UserRegistration::find($id)->delete();
        return redirect('/');
    }

    public function search(Request $request)
    {
        $users = UserRegistration::where('email', 'LIKE', "%{$request->email}%")->get();
        return view('index', compact('users'));
    }
}