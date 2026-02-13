function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });

    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(400).json({ error: messages.join(', '), status: 400 });
    }

    req.body = value;
    next();
  };
}

module.exports = { validate };
