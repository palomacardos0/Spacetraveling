import { GetStaticPaths, GetStaticProps } from 'next';
import { BiUser, BiTimeFive } from 'react-icons/bi';
import { MdDateRange } from 'react-icons/md';

import Prismic from "@prismicio/client";
import { ParsedUrlQuery } from "querystring";
import { RichText } from 'prismic-dom';
import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import Head from "next/head"

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Params extends ParsedUrlQuery {
  uid: string;
}

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}
import { useRouter } from 'next/router'
import Header from '../../components/Header';

export default function Post({ post }: PostProps) {

  const router = useRouter()

  if (router.isFallback) {
    return <div className={styles.fallback}>Carregando...</div>
  }

  const wordsCounter = (post.data.content.map(post => {

    return String(post.body).split(' ').length + String(post.heading).split(' ').length

  })).reduce((acumulator, element) => acumulator += element)

  const readingTime = Math.ceil(wordsCounter / 200)



  return (
    <>
      <Head>
        <title>{post.data.title} | Ignews</title>
      </Head>
      <Header />
      <article className={styles.body}>
        <img src={post.data.banner.url} alt="" />
        <div className={`${commonStyles.container} ${styles.post}`}>

          <h1>{post.data.title}</h1>


          <div className={styles.info}>
            <div>
              <MdDateRange />
              <time>{post.first_publication_date}</time>
            </div>
            <div>
              <BiUser />
              <span>{post.data.author}</span>
            </div>
            <div>
              <BiTimeFive />
              <time>{readingTime} min</time>
            </div>
          </div>

          {post.data.content.map(texto => (
            <main key={texto.heading}>
              <h2>{texto.heading}</h2>
              <div
                dangerouslySetInnerHTML={{ __html: String(texto.body) }} />
            </main>


          )
          )}
        </div>

      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {

  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ],
    {
      fetch: ['post.uid'],
      pageSize: 1,

    });

  return {
    paths: [{ params: { slug: posts.results[0].uid } }],
    fallback: true,
  }

};
export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params as Params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: format(
      new Date(response.last_publication_date),
      "PP",
      {
        locale: ptBR,
      }
    ),
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(ctt => {
        return ({
          heading: ctt.heading,
          body: (RichText.asHtml(ctt.body))

        })
      }),
    },

  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30 //30 min
  }

};

