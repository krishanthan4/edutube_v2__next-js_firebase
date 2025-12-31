'use client';
import CreateGuidance from '../../create/page';
import { use } from 'react';

interface EditGuidanceProps {
  params: Promise<{ id: string }>;
}

export default function EditGuidance({ params }: EditGuidanceProps) {
  const resolvedParams = use(params);
  
  return <CreateGuidance params={Promise.resolve(resolvedParams)} />;
}