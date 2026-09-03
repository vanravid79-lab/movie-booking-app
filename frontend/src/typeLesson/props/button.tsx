// we type of ts like
type props = {
  backgroundColor: string;
  fontSize: number;
  // specific array of padding
  padding: [number, number];
};

function ButtonCom(
  { backgroundColor, fontSize, padding }: props,
  // backgroundColor: string;
  // fontSize: number;
) {
  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        fontSize: fontSize,
        padding: `${padding[0]}px  ${padding[1]}px`,
      }}
      className="rounded px-4 py-2 text-white"
    >
      button
    </div>
  );
}

export default ButtonCom;
