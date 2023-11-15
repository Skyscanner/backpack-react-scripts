'use strict';

const imageInlineSizeLimit = parseInt(
  process.env.IMAGE_INLINE_SIZE_LIMIT || '10000'
);

function getAssetLoaders() {
  return [
    // TODO: Merge this config once `image/avif` is in the mime-db
    // https://github.com/jshttp/mime-db
    {
      test: [/\.avif$/],
      type: 'asset',
      mimetype: 'image/avif',
      parser: {
        dataUrlCondition: {
          maxSize: imageInlineSizeLimit,
        },
      },
    },
    {
      test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
      type: 'asset',
      parser: {
        dataUrlCondition: {
          maxSize: imageInlineSizeLimit,
        },
      },
    },
    {
      test: /\.svg$/,
      use: [
        {
          loader: require.resolve('@svgr/webpack'),
          options: {
            prettier: false,
            svgoConfig: {
              plugins: [
                {
                  name: 'preset-default',
                  params: {
                    overrides: {
                      removeViewBox: false,
                    },
                  },
                },
              ],
            },
            titleProp: true,
            ref: true,
          },
        },
        {
          loader: require.resolve('file-loader'),
          options: {
            name: 'static/media/[name].[contenthash:8].[ext]',
          },
        },
      ],
      issuer: {
        and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
      },
    },
  ];
}

module.exports = {
  getAssetLoaders,
};
