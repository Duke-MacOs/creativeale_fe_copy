import { IMessage } from '../type';

export default ({ msg }: { msg: IMessage[] }) => {
  return msg.length !== 0 ? (
    <div
      style={{
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'red',
        zIndex: 999,
      }}
    >
      {msg.map((i, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: '10px',
            borderRadius: '10px',
            background: 'blue',
          }}
        >
          {i.msg}
        </div>
      ))}
    </div>
  ) : null;
};
