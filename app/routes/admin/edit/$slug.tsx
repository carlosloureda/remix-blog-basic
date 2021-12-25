import {
  ActionFunction,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useTransition,
} from "remix";
import type { LoaderFunction } from "remix";
import invariant from "tiny-invariant";
import { editPost, getPost } from "~/post";

type PostEditError = {
  title?: boolean;
  slug?: boolean;
  markdown?: boolean;
  oldSlug?: boolean;
};

export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, "expected params.slug");
  return getPost(params.slug);
};

export const action: ActionFunction = async ({ request }) => {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();

  const title = formData.get("title");
  const slug = formData.get("slug");
  const markdown = formData.get("markdown");
  const oldSlug = formData.get("oldSlug");

  const errors: PostEditError = {};
  if (!title) errors.title = true;
  if (!slug) errors.slug = true;
  if (!markdown) errors.markdown = true;
  if (!oldSlug) errors.oldSlug = true;

  if (Object.keys(errors).length) {
    return errors;
  }

  invariant(typeof title === "string");
  invariant(typeof slug === "string");
  invariant(typeof markdown === "string");
  invariant(typeof oldSlug === "string");

  await editPost({ title, slug, markdown, oldSlug });

  return redirect("/admin");
};
export default function EditPost() {
  const post = useLoaderData();
  const errors = useActionData();
  const transition = useTransition();

  console.log("post", post);
  return (
    <Form method="post">
      <p>
        <label>
          Post Title: {""}
          {errors?.title ? <em>Title is required</em> : null}
          <input type="text" name="title" defaultValue={post.title} />
        </label>
        <input hidden type="text" name="oldSlug" defaultValue={post.slug} />
      </p>
      <p>
        <label>
          Post Slug: {errors?.slug ? <em>Slug is required</em> : null}
          <input type="text" name="slug" defaultValue={post.slug} />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown:</label>{" "}
        {errors?.markdown ? <em>Markdown is required</em> : null}
        <br />
        <textarea rows={20} name="markdown" defaultValue={post.markdown} />
      </p>
      <p>
        <button type="submit">
          {transition.submission ? "Saving..." : "Save Post"}
        </button>
      </p>
      <p>
        <Link to="/admin">Back</Link>
      </p>
    </Form>
  );
}
