import { useState } from 'react';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from "@prismicio/client";
import { getPrismicClient } from '../services/prismic';

import { BiUser } from 'react-icons/bi';
import { MdDateRange } from 'react-icons/md';
import { format } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  preview: boolean
  postsPagination: PostPagination;
}

export default function Home({ preview, postsPagination }: HomeProps) {

  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [postList, setPostList] = useState<Post[]>(postsPagination.results);

  function nextPageClick() {
    if (nextPage != null) {
      fetch(nextPage).then(response => response.json()).then(data => {
        setNextPage(data.next_page)

        const nextPosts = {
          uid: data.results[0].uid,
          first_publication_date: format(
            new Date(data.results[0].first_publication_date),
            "PP",
            {
              locale: ptBR,
            }
          ),
          data: {
            title: data.results[0].data.title,
            subtitle: data.results[0].data.subtitle,
            author: data.results[0].data.author,
          }
        };
        setPostList([...postList, nextPosts])
      }
      )
    }
  }
  return (<>
    <Head>
      <title>Início | Spacetraveling</title>
    </Head>

    <main className={commonStyles.container}>
      <img src="/images/logo.svg" alt="logo" className={styles.logo} />
      <div className={styles.post}>

        {postList.map(post => (

          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong>{post.data.title}</strong>
              <p>
                {post.data.subtitle}
              </p>
              <div className={styles.postInfo}>
                <div>
                  <MdDateRange />
                  <time>
                    {format(
                      new Date(post.first_publication_date),
                      "PP",
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                </div>
                <div>
                  <BiUser />
                  <span>{post.data.author}</span>
                </div>
              </div>
            </a>
          </Link>
        ))}


      </div>
      <footer>
        {
          nextPage == null || (<button className={styles.linkLoad} onClick={nextPageClick}>
            Carregar mais posts
          </button>)
        }
        {preview && (
          <aside >
            <Link href="/api/exit-preview">
              <a className={commonStyles.exitPreview}>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </footer>
    </main>


  </>)
}

export const getStaticProps: GetStaticProps = async ({ preview = false, previewData }) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],
    {
      fetch: ['posts.title', 'posts.content', 'posts.author', 'posts.subtitle', 'next_page'],
      pageSize: 2,
      ref: previewData?.ref ?? null,

    });



  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }

    }
  })

  return {
    props: {
      preview,
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    }
  }

};
