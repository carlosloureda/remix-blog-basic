import { Link } from "remix";

export default function AdminIndex() {
  return (
    <>
      <p>
        <Link to="new">Crate a New Post</Link>
      </p>
    </>
  );
}
