import { FC } from 'react';

const InfoPage: FC = () => (
  <div className="prose">
    <h1>Design Extensions Mesh integration for Uniform ({process.env.NEXT_PUBLIC_APP_VERSION} version)</h1>
    <p>Please use it via Uniform platform</p>
    <p>Build time: {new Date(Number(process.env.NEXT_PUBLIC_BUILD_TIMESTAMP)).toString()}</p>
  </div>
);

export default InfoPage;
