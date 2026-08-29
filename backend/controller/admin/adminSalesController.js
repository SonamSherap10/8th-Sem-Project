const db = require("../../model/index");
const { Op } = require("sequelize");

const { Sequelize } = db;

const setTarget = async (req, res) => {
  try {
    const { user_id, target_amount, month, year } = req.body;

    if (!user_id || target_amount === undefined || !month || !year) {
      return res.status(400).json({ error: "user_id, target_amount, month, and year are required" });
    }

    const user = await db.User.findByPk(user_id);
    console.log("User found for target:", user);
    if (!user || user.role !== "sales_rep") {
      return res.status(400).json({ error: "User must exist and have role sales_rep" });
    }

    const existingTarget = await db.SalesTarget.findOne({
      where: { user_id, month, year },
    });

    if (existingTarget) {
      return res.status(400).json({
        error: "A sales target already exists for this user, month, and year. Use the update endpoint instead",
      });
    }

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "month must be between 1 and 12" });
    }

    if (!Number.isInteger(yearNum) || String(yearNum).length !== 4) {
      return res.status(400).json({ error: "year must be a 4-digit number" });
    }

    if (Number(target_amount) <= 0) {
      return res.status(400).json({ error: "target_amount must be a positive number" });
    }

    const target = await db.SalesTarget.create({
      user_id,
      target_amount,
      month: monthNum,
      year: yearNum,
    });

    const targetWithUser = await db.SalesTarget.findByPk(target.id, {
      include: [
        {
          model: db.User,
          attributes: ["name"],
        },
      ],
    });

    res.status(201).json({ message: "Sales target created successfully", data: targetWithUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllTargets = async (req, res) => {
  try {
    const where = {};

    if (req.query.user_id) {
      where.user_id = req.query.user_id;
    }

    if (req.query.month) {
      where.month = req.query.month;
    }

    if (req.query.year) {
      where.year = req.query.year;
    }

    const targets = await db.SalesTarget.findAll({
      where,
      include: [
        {
          model: db.User,
          attributes: ["name", "email"],
        },
      ],
    });

    res.status(200).json({ message: "Sales targets retrieved successfully", data: targets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getTargetById = async (req, res) => {
  try {
    const target = await db.SalesTarget.findByPk(req.params.id, {
      include: [
        {
          model: db.User,
          attributes: ["name", "email"],
        },
      ],
    });

    if (!target) {
      return res.status(404).json({ error: "Sales target not found" });
    }

    res.status(200).json({ message: "Sales target retrieved successfully", data: target });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateTarget = async (req, res) => {
  try {
    if (req.body.user_id !== undefined || req.body.month !== undefined || req.body.year !== undefined) {
      return res.status(400).json({ error: "user_id, month, and year cannot be changed" });
    }

    const { target_amount } = req.body;

    if (target_amount === undefined) {
      return res.status(400).json({ error: "target_amount is required" });
    }

    if (Number(target_amount) <= 0) {
      return res.status(400).json({ error: "target_amount must be a positive number" });
    }

    const target = await db.SalesTarget.findByPk(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Sales target not found" });
    }

    await target.update({ target_amount });

    res.status(200).json({ message: "Sales target updated successfully", data: target });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteTarget = async (req, res) => {
  try {
    const target = await db.SalesTarget.findByPk(req.params.id);
    if (!target) {
      return res.status(404).json({ error: "Sales target not found" });
    }

    await target.destroy();

    res.status(200).json({ message: "Sales target deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const parseMonthYear = (month, year) => {
  const monthNum = Number(month);
  const yearNum = Number(year);

  if (!month || !year) {
    return { error: "month and year query parameters are required" };
  }

  if (!Number.isInteger(monthNum) || monthNum < 1 || monthNum > 12) {
    return { error: "month must be between 1 and 12" };
  }

  if (!Number.isInteger(yearNum) || String(yearNum).length !== 4) {
    return { error: "year must be a 4-digit number" };
  }

  return { monthNum, yearNum };
};

const getRepMetrics = async (userId, monthNum, yearNum) => {
  const orderWhere = {
    sales_rep_id: userId,
    status: { [Op.ne]: "cancelled" },
    [Op.and]: [
      Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("order_date")), monthNum),
      Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("order_date")), yearNum),
    ],
  };

  const totalSold = await db.Order.sum("total_amount", { where: orderWhere });
  const orderCount = await db.Order.count({ where: orderWhere });

  const salesTarget = await db.SalesTarget.findOne({
    where: { user_id: userId, month: monthNum, year: yearNum },
  });

  const targetAmount = salesTarget ? Number(salesTarget.target_amount) : 0;
  const soldAmount = Number(totalSold || 0);
  const salesAchievementPercent = targetAmount > 0 ? (soldAmount / targetAmount) * 100 : 0;

  const totalDueRows = await db.sequelize.query(
    `SELECT COALESCE(SUM(i.total_amount), 0) as total
     FROM Invoices i
     JOIN Orders o ON i.order_id = o.id
     WHERE o.sales_rep_id = :user_id
       AND o.status != 'cancelled'
       AND MONTH(o.order_date) = :month
       AND YEAR(o.order_date) = :year`,
    {
      replacements: { user_id: userId, month: monthNum, year: yearNum },
      type: db.sequelize.QueryTypes.SELECT,
    }
  );

  const dueAmount = Number(totalDueRows[0]?.total || 0);

  const totalCollected = await db.Payment.sum("amount", {
    where: {
      collected_by: userId,
      [Op.and]: [
        Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("payment_date")), monthNum),
        Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("payment_date")), yearNum),
      ],
    },
  });

  const collectedAmount = Number(totalCollected || 0);
  const collectionRatePercent = dueAmount > 0 ? (collectedAmount / dueAmount) * 100 : 0;
  const performanceScore = (salesAchievementPercent * 0.6) + (collectionRatePercent * 0.4);

  return {
    total_sold: soldAmount,
    target_amount: targetAmount,
    sales_achievement_percent: Math.round(salesAchievementPercent * 100) / 100,
    total_due: dueAmount,
    total_collected: collectedAmount,
    collection_rate_percent: Math.round(collectionRatePercent * 100) / 100,
    order_count: orderCount,
    performance_score: Math.round(performanceScore * 100) / 100,
  };
};

const getOverallSalesReport = async (req, res) => {
  try {
    const parsed = parseMonthYear(req.query.month, req.query.year);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const { monthNum, yearNum } = parsed;

    const salesReps = await db.User.findAll({
      where: { role: "sales_rep" },
      attributes: ["id", "name", "email", "is_active"],
      order: [["name", "ASC"]],
    });

    const salesRepsReport = [];

    for (const rep of salesReps) {
      const metrics = await getRepMetrics(rep.id, monthNum, yearNum);
      salesRepsReport.push({
        user_id: rep.id,
        name: rep.name,
        email: rep.email,
        is_active: rep.is_active,
        ...metrics,
      });
    }

    salesRepsReport.sort((a, b) => b.total_sold - a.total_sold);

    const summary = salesRepsReport.reduce(
      (acc, rep) => ({
        total_sold: acc.total_sold + rep.total_sold,
        total_target: acc.total_target + rep.target_amount,
        total_due: acc.total_due + rep.total_due,
        total_collected: acc.total_collected + rep.total_collected,
        total_orders: acc.total_orders + rep.order_count,
      }),
      { total_sold: 0, total_target: 0, total_due: 0, total_collected: 0, total_orders: 0 }
    );

    summary.sales_achievement_percent = summary.total_target > 0
      ? Math.round((summary.total_sold / summary.total_target) * 10000) / 100
      : 0;

    summary.collection_rate_percent = summary.total_due > 0
      ? Math.round((summary.total_collected / summary.total_due) * 10000) / 100
      : 0;

    summary.performance_score = Math.round(
      (summary.sales_achievement_percent * 0.6 + summary.collection_rate_percent * 0.4) * 100
    ) / 100;

    summary.active_sales_reps = salesReps.filter((rep) => rep.is_active).length;
    summary.reps_with_sales = salesRepsReport.filter((rep) => rep.total_sold > 0).length;

    res.status(200).json({
      message: "Overall sales report retrieved successfully",
      data: {
        month: monthNum,
        year: yearNum,
        summary,
        sales_reps: salesRepsReport,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getRepPerformance = async (req, res) => {
  try {
    const { user_id } = req.params;
    const parsed = parseMonthYear(req.query.month, req.query.year);
    if (parsed.error) {
      return res.status(400).json({ error: parsed.error });
    }

    const { monthNum, yearNum } = parsed;

    const user = await db.User.findByPk(user_id, {
      attributes: { exclude: ["password_hash"] },
    });

    if (!user || user.role !== "sales_rep") {
      return res.status(400).json({ error: "User must exist and have role sales_rep" });
    }

    const metrics = await getRepMetrics(user_id, monthNum, yearNum);

    if (metrics.order_count === 0) {
      return res.status(404).json({
        error: `No orders found for this sales rep in ${monthNum}/${yearNum}`,
      });
    }

    res.status(200).json({
      message: "Rep performance retrieved successfully",
      data: {
        name: user.name,
        month: monthNum,
        year: yearNum,
        ...metrics,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createRegion = async (req, res) => {
  try {
    const { name ,description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Region name is required" });
    }

    const existingRegion = await db.Region.findOne({ where: { name } });
    if (existingRegion) {
      return res.status(400).json({ error: "Region with this name already exists" });
    }

    const region = await db.Region.create({ name, description });

    res.status(201).json({ message: "Region created successfully", data: region });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await db.Order.findAll({
      include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.User, as: "SalesRep", attributes: ["name"] },
        { model: db.OrderItem, include: [{ model: db.Product, attributes: ["name"] }] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ message: "Orders retrieved successfully", data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await db.Order.findByPk(req.params.id, {include: [
        { model: db.Retailer, attributes: ["name"] },
        { model: db.User, as: "SalesRep", attributes: ["name"] },
        { model: db.OrderItem, include: [{ model: db.Product, attributes: ["name"] }] },
      ]});

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order retrieved successfully", data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}      

module.exports = {
  setTarget,
  getAllTargets,
  getTargetById,
  updateTarget,
  deleteTarget,
  getOverallSalesReport,
  getRepPerformance,
  createRegion,
  getAllOrders,
  getOrderById,
};