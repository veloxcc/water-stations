const cache = function() {
  const data = [];

  const add = (newData) => {
    const isUnique = id => data.filter(r => r._id === id).length === 0;
    const unique = newData.filter(item => isUnique(item._id));
    data.push(...unique);
  }

  return ({
    data,
    add,
  });
}

export default new cache();
