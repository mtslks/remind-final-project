import { css } from '@emotion/react';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Layout from '../../components/Layout';
import {
  buttonContainer,
  buttonStylesStandard,
  heroSection,
  heroSectionHeading,
  heroSectionHeadingImageContainer,
  heroSectionImage,
  imageContainer,
  tilesContainer,
} from '../../styles/styles';
import { Errors, Tile } from '../../util/types';

type Props = {
  username?: string;
  // moods: Mood;
  tiles: Tile;
  errors: Errors[];
  day: string;
  tileId: Number;
};

export default function SingleTile(props: Props) {
  const [showEdit, setShowEdit] = useState(true);
  const [errors, setErrors] = useState('');

  const router = useRouter();

  if ('errors' in props) {
    return <div>Error: {props.errors[0].message}</div>;
  }

  if (!props.username) {
    return <div>no user passed</div>;
  }

  return (
    <Layout username={props.username}>
      {' '}
      <Head>
        <title>Detailed Tile View {props.tiles.day}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section css={heroSection}>
        <div css={heroSectionHeadingImageContainer}>
          <div css={heroSectionHeading}>
            <div css={tilesContainer}>
              <h2>Single Tile Page for {props.tiles.day}</h2>
              <div>Achievements: {props.tiles.achievements}</div>
              <div>Gratitude: {props.tiles.gratitude}</div>
            </div>
            <div css={buttonContainer}>
              {/* Delete Tile */}
              <button
                css={buttonStylesStandard}
                onClick={async (event) => {
                  event.preventDefault();
                  if (
                    !window.confirm(
                      `Do you really want to delete this tile? It will be gone forever.`,
                    )
                  ) {
                    return;
                  }

                  const response = await fetch(
                    `/api/dashboard/${props.tileId}`,
                    {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        id: props.tileId,
                      }),
                    },
                  );

                  const json = await response.json();

                  if ('errors' in json) {
                    setErrors(json.errors[0].message);
                    return;
                  }

                  // Navigate back to dashboard after deletion
                  router.push(`/dashboard`);
                }}
              >
                Delete entry
              </button>
            </div>
            <Link href="/dashboard">
              <a css={buttonStylesStandard}>Back</a>
            </Link>
            <Link href="/logout">
              <a css={buttonStylesStandard}>Logout</a>
            </Link>
          </div>
          <div css={heroSectionImage}>
            <img
              src="../../images/A-Human/tile_walking.svg"
              alt="Walking girl"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { getValidSessionByToken /* getMood */ } = await import(
    '../../util/database'
  );

  // Authorization: Allow only logged-in users
  const isValidSession = await getValidSessionByToken(
    context.req.cookies.sessionToken,
  );
  const sessionToken = context.req.cookies.sessionToken;

  if (!isValidSession) {
    return {
      redirect: {
        permanent: false,
        destination: '/login?returnTo=/dashboard',
      },
    };
  }
  const baseUrl = process.env.BASE_URL;
  const tileResponse = await fetch(
    `${baseUrl}/api/dashboard/${context.query.tileId}`,
    {
      method: 'GET',
      headers: {
        cookie: `sessionToken=${sessionToken}`,
      },
      credentials: 'include',
    },
  );
  const tiles = await tileResponse.json();
  // const moods = await getMood();

  return {
    props: { userId: isValidSession.userId, tiles /* moods */ },
  };
}
