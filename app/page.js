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
        {/* <div style={{ width: 300 }}>
        <Autocomplete
          width='300px'
          id='free-solo-demo'
          freeSolo
          options={inventory.map((item) => item.name)}
          renderInput={(params) => (
            <TextField
              {...params}
              label='Search'
              margin='normal'
              variant='outlined'
            />
          )}
        />
      </div> */}

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
          {searchResult.map(({ name, quantity }) => (
            <Paper
              key={name}
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
                {name.charAt(0).toUpperCase() + name.slice(1)}
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
                    addItem(name);
                  }}
                  sx={{
                    aspectRatio: '1/1',
                    borderRadius: '50%',
                    width: '50px',
                  }}
                >
                  +
                </Button>

                <Typography variant='h3' color='#333' textAlign='center'>
                  {quantity}
                </Typography>

                <Button
                  variant='contained'
                  onClick={() => {
                    removeItem(name);
                  }}
                >
                  -
                </Button>
              </Box>
              <Button
                variant='contained'
                onClick={() => {
                  removeItemAll(name);
                }}
                sx={{ width: '100%' }}
              >
                Remove All
              </Button>
            </Paper>
          ))}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
