'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { firestore } from '@/firebase';
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

import {
  Box,
  Modal,
  Typography,
  Stack,
  TextField,
  Button,
  Autocomplete,
  ThemeProvider,
  createTheme,
  Paper,
} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#013e87',
    },
    secondary: {
      main: '#2e74c9',
    },
  },
  typography: {
    h1: {
      fontSize: '3rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
  },
});

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchResult, setSearchResult] = useState(inventory);
  const [itemName, setItemName] = useState('');

  // Adding states to keep track fo the item modals
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Function to handle opening of item modal
  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setItemModalOpen(true);
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setItemModalOpen(false);
    setSelectedItem(null);
  };

  const ItemModal = ({ item, isOpen, onClose, onSave }) => {
    const [editedItem, setEditedItem] = useState(item || {});

    useEffect(() => {
      setEditedItem(item || {});
    }, [item]);

    const handleChange = (e) => {
      if (e.target) {
        const { name, value } = e.target;
        if (name) {
          setEditedItem((prev) => ({ ...prev, [name]: value }));
        } else {
          console.error("The target element does not have a 'name' attribute.");
        }
      } else {
        console.error('Event target is null.');
      }
    };

    const handleSave = () => {
      onSave(editedItem);
      onClose();
    };

    if (!isOpen) {
      return null;
    }

    return (
      <Modal open={isOpen} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant='h6' component='h2'>
            Edit Item
          </Typography>
          <TextField
            label='Name'
            name='name'
            value={editedItem.name}
            onChange={handleChange}
            fullWidth
            margin='normal'
          />
          <TextField
            label='Quantity'
            name='quantity'
            value={editedItem.quantity}
            onChange={handleChange}
            fullWidth
            margin='normal'
          />
          {/* Add more fields as needed */}
          <Button onClick={handleSave} variant='contained' sx={{ mt: 2 }}>
            Save
          </Button>
        </Box>
      </Modal>
    );
  };

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setSearchResult(inventoryList);
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }

    await updateInventory();
  };

  const removeItemAll = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
    }

    await updateInventory();
  };

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (search === '') {
      setSearchResult(inventory);
    } else {
      setSearchResult(
        inventory.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, inventory]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <ThemeProvider theme={theme}>
      <Box
        width='100vw'
        height='100vh'
        display='flex'
        flexDirection='column'
        alignItems='center'
        gap={2}
      >
        <Modal open={open} onClose={handleClose}>
          <Box
            position='absolute'
            top='50%'
            left='50%'
            width={400}
            bgcolor='white'
            border='2px solid #000'
            boxShadow={24}
            p={4}
            display='flex'
            flexDirection='column'
            gap={3}
            sx={{
              transform: 'translate(-50%, -50%)',
            }}
          >
            <Typography variant='h6'>Add Item</Typography>
            <Stack width='100%' direction='row' spacing={2}>
              <TextField
                variant='outlined'
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
              <Button
                variant='outlined'
                onClick={() => {
                  addItem(itemName);
                  setItemName('');
                  handleClose();
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Typography
          variant='h1'
          sx={{
            my: 1,
            p: 2,
            textAlign: 'center',
            color: 'primary.main',
          }}
        >
          Inventory Items
        </Typography>

        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            px: 4,
          }}
        >
          <TextField
            id='search-items'
            label='Search'
            variant='outlined'
            sx={{ width: '300px' }}
            onChange={handleSearchChange}
          />
          <Button
            variant='contained'
            onClick={() => handleOpen()}
            sx={{ mr: 4 }}
          >
            Add New Item
          </Button>
        </Box>

        <Box
          id
          width='100%'
          p={5}
          sx={{
            gap: '12px',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap',
          }}
        >
          {searchResult.map((item) => (
            <Paper
              key={item.name}
              elevation={8}
              sx={{
                width: { xs: '100%', md: 'auto' },
                padding: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1, md: 3 },
              }}
            >
              <Typography variant='h3' color='#333' textAlign='center'>
                {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  width: '100%',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    removeItem(item.name);
                  }}
                  sx={{
                    aspectRatio: '1/1',
                    borderRadius: '50%',
                    width: '50px',
                  }}
                >
                  -
                </Button>

                <Typography variant='h3' color='#333' textAlign='center'>
                  {item.quantity}
                </Typography>

                <Button
                  variant='outlined'
                  size='small'
                  onClick={() => {
                    addItem(item.name);
                  }}
                  sx={{
                    aspectRatio: '1/1',
                    borderRadius: '50%',
                    width: '50px',
                  }}
                >
                  +
                </Button>
              </Box>
              <Button
                variant='contained'
                onClick={() => {
                  removeItemAll(item.name);
                }}
                sx={{ width: '100%' }}
              >
                Remove All
              </Button>
              <Button
                variant='outlined'
                onClick={() => handleOpenModal(item)}
                sx={{ width: '100%' }}
              >
                Expand
              </Button>
            </Paper>
          ))}
        </Box>
        <ItemModal
          item={selectedItem}
          isOpen={itemModalOpen}
          onClose={handleCloseModal}
          onSave={(updatedItem) => {
            // Handle save logic here, e.g., update the state or make an API call
            console.log('Updated Item:', updatedItem);
          }}
        />
      </Box>
    </ThemeProvider>
  );
}
