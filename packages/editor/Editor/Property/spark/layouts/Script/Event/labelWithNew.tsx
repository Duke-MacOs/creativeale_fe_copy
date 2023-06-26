import newTag from './new_tag.gif';

export const labelWithNew = (name: string) => {
  return (
    <>
      {name}
      <img style={{ width: 20, height: 12 }} src={newTag} />
    </>
  );
};
