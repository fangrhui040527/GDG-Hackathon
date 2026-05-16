CREATE VECTOR INDEX documents_embedding_idx
ON `yokoyoko.vector_dw.documents` (embedding)
OPTIONS (
  distance_type = 'COSINE',
  index_type = 'IVF',
  ivf_options = '{"num_lists": 100}'
);