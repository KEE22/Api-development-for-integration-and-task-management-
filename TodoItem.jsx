import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  IconButton,
  Checkbox,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EditTodoDialog from './EditTodoDialog';

const TodoItem = ({ todo, onUpdate, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = () => {
    onUpdate(todo._id, {
      status: todo.status === 'completed' ? 'pending' : 'completed'
    });
  };

  const handleDelete = () => {
    onDelete(todo._id);
    handleMenuClose();
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  return (
    <>
      <ListItem
        secondaryAction={
          <IconButton edge="end" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
        }
      >
        <Checkbox
          checked={todo.status === 'completed'}
          onChange={handleStatusChange}
        />
        <ListItemText
          primary={
            <Typography
              style={{
                textDecoration:
                  todo.status === 'completed' ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </Typography>
          }
          secondary={todo.description}
        />
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>
      <EditTodoDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        todo={todo}
        onUpdate={onUpdate}
      />
    </>
  );
};

export default TodoItem; 