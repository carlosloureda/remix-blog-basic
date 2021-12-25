import path from "path";
import fs from "fs/promises";
import parseFrontMatter from "front-matter";
import invariant from "tiny-invariant";
import { marked } from "marked";

export type Post = {
  slug: string;
  title: string;
};

type NewPost = {
  title: string;
  slug: string;
  markdown: string;
};

type EditPost = {
  title: string;
  slug: string;
  markdown: string;
  oldSlug: string;
};

export type PostMarkdownAttributes = {
  title: string;
};

const postsPath = path.join(__dirname, "..", "posts");

function isValidPostAttributes(
  attributes: any
): attributes is PostMarkdownAttributes {
  return attributes?.title;
}

export const getPost = async (slug: string) => {
  const filePath = path.join(postsPath, slug + ".md");
  const file = await fs.readFile(filePath);
  const { attributes, body } = parseFrontMatter(file.toString());
  console.log("attributes", attributes);
  console.log("body", body);
  invariant(
    isValidPostAttributes(attributes),
    `Post ${filePath} is missing attributes`
  );

  const html = marked(body);
  console.log("html", html);
  return { slug, html, markdown: body, title: attributes.title };
};

export const getPosts = async (): Promise<Post[]> => {
  const dir = await fs.readdir(postsPath);

  return Promise.all(
    dir.map(async (filename) => {
      const file = await fs.readFile(path.join(postsPath, filename));
      const { attributes } = parseFrontMatter(file.toString());
      invariant(
        isValidPostAttributes(attributes),
        `${filename} has bad metada data!`
      );
      return {
        slug: filename.replace(/\.md$/, ""),
        title: attributes.title,
      };
    })
  );
};

export async function createPost(post: NewPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  await fs.writeFile(path.join(postsPath, post.slug + ".md"), md);
  return getPost(post.slug);
}

export async function editPost(post: EditPost) {
  const md = `---\ntitle: ${post.title}\n---\n\n${post.markdown}`;
  try {
    // throw new Error("Not implemented");
    await fs.writeFile(path.join(postsPath, post.slug + ".md"), md);
    if (post.oldSlug !== post.slug) {
      await fs.unlink(path.join(postsPath, post.oldSlug + ".md"));
    }
    return getPost(post.slug);
  } catch (error) {
    return Promise.reject(error);
  }
}
