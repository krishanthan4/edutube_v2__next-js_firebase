'use client';
import CreatePathway from '../../create/page';
import { use } from 'react';

interface EditPathwayProps {
  params: Promise<{ id: string }>;
}

export default function EditPathway({ params }: EditPathwayProps) {
  const resolvedParams = use(params);
  
  return <CreatePathway params={Promise.resolve(resolvedParams)} />;
}