
import { supabase } from "@/lib/supabase";
import { timeInfos } from "@/data/mockData";

export const seedTimeInfos = async () => {
  console.log("Inserting time info symbols...");
  
  const { data: timeInfoData, error: timeInfoError } = await supabase
    .from('time_infos')
    .upsert(timeInfos.map(info => ({
      symbol: info.symbol,
      description: info.description
    })), {
      onConflict: 'symbol'
    })
    .select();
    
  if (timeInfoError) {
    console.error("Time info error details:", timeInfoError);
    throw new Error(`Error inserting time infos: ${timeInfoError.message}`);
  }
  
  console.log(`✅ Inserted ${timeInfoData?.length || 0} time infos`);
  
  // Create a mapping of symbols to database IDs for time infos
  const timeInfoMap = timeInfoData?.reduce((acc, info) => {
    const originalInfo = timeInfos.find(ti => ti.symbol === info.symbol);
    if (originalInfo) {
      acc[originalInfo.id] = info.id;
    }
    return acc;
  }, {} as Record<string, string>) || {};
  
  return timeInfoMap;
};
