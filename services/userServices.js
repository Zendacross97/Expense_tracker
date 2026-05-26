const User = require('../models/userModel');

exports.getUserByEmail = async (email) => {
  try {
    // findOne returns a single matching document
    return await User.findOne({ email: email });
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error; // rethrow so controller can handle it
  }
};

exports.createUser = async (name, email, passwordHash) => {
  try {
    return await User.create({
      name,
      email,
      password: {
        hash: passwordHash,   
        uuid: null,          
        isactive: false        
      },
      totalExpense: 0,        
      downloads: { files: [] }, 
      order: { orderId: '', status: 'PENDING' } 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

exports.createUuid = async (uuid, userId) => {
  try {
    // update the password field for the given user
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'password.uuid': uuid,       // set reset token
          'password.isactive': true      // mark reset active
        }
      },
      { returnDocument: 'after', runValidators: true } // return the updated document
    );
  } catch (error) {
    console.error('Error creating UUID:', error);
    throw error;
  }
};

exports.getUuid = async (uuid) => {
  try {
    // find all matching documents
    return await User.findOne({
      'password.uuid': uuid,   
      'password.isactive': true  
    });
  } catch (error) {
    console.error('Error fetching UUID:', error);
    throw error;
  }
};

exports.updateUuidStatus = async (uuid) => {
  try {
    return await User.updateOne(
      { 'password.uuid': uuid }, // filter
      { $set: { 'password.isactive': false } } // update
    );
  } catch (error) {
    console.error('Error updating UUID:', error);
    throw error;
  }
};

exports.updateUserPassword = async (hash, userId) => {
  try {
    return await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          'password.hash': hash,       // update the hash
          'password.uuid': null,       // clear reset token
          'password.status': false     // mark reset inactive
        }
      },
      { returnDocument: 'after', runValidators: true } // return updated document
    );
  } catch (error) {
    console.error('Error updating user password:', error);
    throw error;
  }
};

exports.adjustTotalExpense = async (userId, amountDelta, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found');

  user.totalExpense += Number(amountDelta);

  // Prevent negative totals
  if (user.totalExpense < 0) {
    user.totalExpense = 0;
  }
  return await user.save({ session });
};

exports.getUserNameAndTotalExpense = async (limit = 5) => {
  try {
    return await User.find({})
      .select('name totalExpense')
      .sort({ totalExpense: -1 })
      .limit(limit)
      .lean(); // return plain JS objects, not Mongoose docs
  } catch (error) {
    throw new Error(`Error fetching top users: ${error.message}`);
  }
};

exports.addDownloadedFile = async (userId, fileUrl, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found');

  user.downloads.files.push({ fileUrl });
  return await user.save({ session });
};

exports.getDownloadedFilesByUserId = async (userId, session) => {
  const user = await User.findById(userId).select('downloads.files').session(session);
  if (!user) throw new Error('User not found');
  return user.downloads.files;
};

exports.updateOrder = async (userId, orderId, status, session) => {
  const user = await User.findById(userId).session(session);
  if (!user) throw new Error('User not found');

  user.order = { orderId, status };
  return await user.save({ session });
};

exports.getOrderDetails = async (userId, session) => {
  const user = await User.findById(userId).select('order').session(session);
  if (!user) throw new Error('User not found');
  return user.order;
};