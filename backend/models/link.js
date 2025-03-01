module.exports = (sequelize, DataTypes) => {
  const Link = sequelize.define('Link', {
    original_url: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    short_url: { 
      type: DataTypes.STRING, 
      unique: true 
    },
    clicks: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0 
    }
  }, {
    timestamps: true  // Thêm createdAt, updatedAt
  });

  return Link;
};
