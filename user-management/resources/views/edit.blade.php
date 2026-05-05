<!DOCTYPE html>
<html>
<head>
    <title>Edit User</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

<div class="container mt-5">

    <div class="card p-4 shadow">
        <h3>Edit User</h3>

        <form action="/update/{{ $user->id }}" method="POST" enctype="multipart/form-data">
            @csrf

            <input class="form-control mb-2" type="text" name="name" value="{{ $user->name }}">
            <input class="form-control mb-2" type="email" name="email" value="{{ $user->email }}">
            <input class="form-control mb-2" type="text" name="cnic" value="{{ $user->cnic }}">
            <input class="form-control mb-2" type="text" name="telephone" value="{{ $user->telephone }}">
            <textarea class="form-control mb-2" name="comments">{{ $user->comments }}</textarea>

            <input class="form-control mb-3" type="file" name="profile_picture">

            <button class="btn btn-primary w-100">Update</button>
        </form>
    </div>

</div>

</body>
</html>