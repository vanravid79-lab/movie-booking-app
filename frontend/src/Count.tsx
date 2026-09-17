import { useState } from "react";
export const Count = () => {
  // useState
  const [count, setCount] = useState<number>(0);

  const increase = () => {
    setCount(count + 1);
  };

  // also can do  decrease like this
  // const decrease = () => {
  //     setCount(count - 1)
  // }

  return (
    <>
      <h1>Count : {count}</h1>
      <button onClick={increase}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </>
  );
};
