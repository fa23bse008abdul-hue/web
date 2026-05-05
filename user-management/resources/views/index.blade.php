<!DOCTYPE html>
<html>
<head>
    <title>User Management System</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>

<body class="bg-light">

<div class="container mt-4">

    <h2 class="text-center mb-4">User Management System</h2>

    <!-- REGISTER FORM -->
    <div class="card shadow p-4 mb-4">
        <h4>Register User</h4>

        <form action="/store" method="POST" enctype="multipart/form-data">
            @csrf

            <div class="row">
                <div class="col-md-6 mb-2">
                    <input class="form-control" type="text" name="name" placeholder="Name">
                </div>

                <div class="col-md-6 mb-2">
                    <input class="form-control" type="email" name="email" placeholder="Email">
                </div>

                <div class="col-md-6 mb-2">
                    <input class="form-control" type="text" name="cnic" placeholder="CNIC">
                </div>

                <div class="col-md-6 mb-2">
                    <input class="form-control" type="text" name="telephone" placeholder="Telephone">
                </div>

                <div class="col-md-12 mb-2">
                    <textarea class="form-control" name="comments" placeholder="Comments"></textarea>
                </div>

                <div class="col-md-12 mb-2">
                    <input class="form-control" type="file" name="profile_picture">
                </div>

                <div class="col-md-12">
                    <button class="btn btn-primary w-100">Submit</button>
                </div>
            </div>
        </form>
    </div>

    <!-- SEARCH -->
    <div class="card shadow p-3 mb-4">
        <form action="/search" method="GET" class="d-flex">
            <input class="form-control me-2" type="text" name="email" placeholder="Search by email">
            <button class="btn btn-success">Search</button>
        </form>
    </div>

    <!-- TABLE -->
    <div class="card shadow p-4">
        <h4>User List</h4>

        <table class="table table-bordered table-hover mt-3">
            <thead class="table-dark">
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>CNIC</th>
                    <th>Telephone</th>
                    <th>Comments</th>
                    <th>Image</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                @foreach($users as $user)
                <tr>
                    <td>{{ $user->name }}</td>
                    <td>{{ $user->email }}</td>
                    <td>{{ $user->cnic }}</td>
                    <td>{{ $user->telephone }}</td>
                    <td>{{ $user->comments }}</td>
                    <td>
                        @if($user->profile_picture)
                        <img src="{{ asset('uploads/'.$user->profile_picture) }}" width="60">
                        @endif
                    </td>
                    <td>
                        <a class="btn btn-warning btn-sm" href="/edit/{{ $user->id }}">Edit</a>
                        <a class="btn btn-danger btn-sm"
                           href="/delete/{{ $user->id }}"
                           onclick="return confirm('Delete this user?')">
                           Delete
                        </a>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</div>

</body>
</html>