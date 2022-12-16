// En este documento se encontrarán algunas caracteristicas que ayudaran a filtrar la información al momento de hacer una consulta en nuestra base de datos

// Creamos la clase que contendrá las funciones de busqueda
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Esta función nos permitirá filtrar los datos mostrados al cliente con las funciones de mongo para >, >=, <, <=, =.
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Esta función nos permitirá acomodar los datos de acuerdo a algún parametro definido
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
      // sort('price ratingsAverage')
    } else {
      this.query = this.query.sort("-createdAt, _id");
    }
    return this;
  }

  // Esta función nos permitirá limitar los campos de información que serán mostrados al usuario
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }

  // Esta función nos permitirá separar nuestros datos en paginas para desplegarlos.
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

//Exportamos esta clase para poder hacer uso de su contenido
module.exports = APIFeatures;
