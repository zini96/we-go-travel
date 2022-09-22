const continents = [
  { _id: 1, name: "Africa" },
  { _id: 2, name: "Europe" },
  { _id: 3, name: "Asia" },
  { _id: 4, name: "North America" },
  { _id: 5, name: "South America" },
  { _id: 6, name: "Australia" },
  { _id: 7, name: "Antarctica" },
];

const price = [
  { _id: 1, name: "Any", array: [] },
  { _id: 2, name: "0 to $199", array: [0, 199] },
  { _id: 3, name: "$200 to $299", array: [200, 299] },
  { _id: 4, name: "$300 to $349", array: [300, 349] },
  { _id: 5, name: "$350 to $399", array: [350, 399] },
  { _id: 6, name: "$400 to $449", array: [400, 449] },
  { _id: 7, name: "More than $450", array: [450, 1500000] },
];

export { continents, price };
