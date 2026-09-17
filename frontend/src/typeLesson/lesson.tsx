// varaible to declare datatype as well
const link: string =
  "https://www.bing.com/images/search?q=angkor+wat&form=HDRSC3&first=1";

// function
function login(name: string, email: string) {
  return "Name: " + name + "Email :" + email;
}

// array
const student: string[] = ["h", "o", "v"];
console.log(student[1]);

// object
interface User {
  id: number;
  name: string;
  loginDate: Date;
}

const user: User = {
  id: 1,
  name: "peter",
  loginDate: new Date(),
};

console.log(user.id);

// Array of object

interface User2 {
  id: number;
  name: string;
  age: number;
}

const users2: User2[] = [
  {
    id: 1,
    name: "Ravid",
    age: 21,
  },
  {
    id: 2,
    name: "John",
    age: 22,
  },
  {
    id: 3,
    name: "David",
    age: 20,
  },
];

console.log(users2);

function lesson() {
  return (
    <>
      <h1>{link}</h1>
      <span>{login("Ravid", "hong22@gmail.com")}</span>
    </>
  );
}

export default lesson;
