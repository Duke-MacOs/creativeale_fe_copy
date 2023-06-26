export const getRikoAssetProps = async (res: any) => {
  await Promise.all(
    Object.entries(res.files).map(async ([key, content]) => {
      try {
        if (content instanceof Blob) res.files[key] = JSON.parse(await (content as Blob).text());
      } catch (error) {
        console.log(error);
      }
    })
  );
  return res;
};
