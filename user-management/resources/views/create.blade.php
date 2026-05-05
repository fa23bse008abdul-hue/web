<h2>Register User</h2>

<form action="/store" method="POST" enctype="multipart/form-data">
    @csrf

    <input type="text" name="name" placeholder="Name" required><br>
    <input type="email" name="email" placeholder="Email" required><br>
    <input type="text" name="cnic" placeholder="CNIC" required><br>
    <input type="text" name="telephone" placeholder="Telephone"><br>
    <textarea name="comments" placeholder="Comments"></textarea><br>
    <input type="file" name="profile_picture"><br><br>

    <button type="submit">Register</button>
</form>

<a href="/">Back</a>