import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Platform, Dimensions, Image, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

const { width } = Dimensions.get('window');

type Product = {
  id: string;
  title: string;
  category: string;
  price: number;
  image_urls: string[] | string;
  stock?: number;
};

import { fetchAuthSession } from 'aws-amplify/auth';

const categories = ['Todos', 'Vestuário', 'Livros', 'Acessórios'];

export default function StoreScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Navigation states internally
  const [currentView, setCurrentView] = useState<'catalog' | 'cart' | 'checkout' | 'success' | 'orders' | 'orderDetail'>('catalog');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const bgColor = isDark ? '#1a2130' : '#f1f1f1';
  const cardColor = isDark ? '#2c3444' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#11181C';
  const textMuted = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#404c60' : '#EAEAEA';
  const primaryBrand = '#5bc3bb';
  const accentColor = '#0a7ea4';

  const formatPrice = (price: number) => `R$ ${price.toFixed(2).replace('.', ',')}`;

  // Dynamic Catalog
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicCats, setDynamicCats] = useState<string[]>(['Todos']);

  // Filter
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Dynamic Catalog

  React.useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const res = await fetch(`${baseUrl}/pdv/products`, {
         headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const parsed: Product[] = data.map((p: any) => ({
           id: p.id,
           title: p.name,
           category: p.category,
           price: Number(p.price) || 0,
           image_urls: typeof p.image_urls === 'string' ? JSON.parse(p.image_urls) : (p.image_urls || [])
        }));
        setProducts(parsed);
        const cats = Array.from(new Set(parsed.map((p: Product) => p.category))) as string[];
        setDynamicCats(['Todos', ...cats]);
      }
    } catch(e) { console.log(e); } 
      finally { setLoading(false); }
  };

  // Cart
  type CartItem = { id: string, product: Product; quantity: number, observation?: string };
  const [cart, setCart] = useState<CartItem[]>([]);

  // LongPress Modal
  const [showModal, setShowModal] = useState<Product | null>(null);
  const [obsText, setObsText] = useState('');
  const [qtdSelect, setQtdSelect] = useState<number | string>(1);

  // Checkout info
  const [deliveryMethod, setDeliveryMethod] = useState<'church' | 'home'>('church');
  const [pickupDay, setPickupDay] = useState<string | null>(null);
  
  // Home Delivery
  const [cep, setCep] = useState('');
  const [endRua, setEndRua] = useState('');
  const [endNumero, setEndNumero] = useState('');
  const [endAC, setEndAC] = useState('');
  const [endHorario, setEndHorario] = useState('');

  // Orders Data
  const [orders, setOrders] = useState<any[]>([
    { 
      id: 'ORD-9821', date: '10 Nov 2025', status: 'ENTREGUE', total: 119.80, items: 2, 
      itemsDetail: [ { name: 'Camiseta Leão de Judá', qty: 1, price: 69.90 }, { name: 'Boné Fé', qty: 1, price: 49.90 } ],
      delivery: 'Retirar na Igreja',
    },
  ]);

  const addToCart = (product: Product, quantity: number = 1, observation: string = '') => {
    setCart((prev) => {
      // Se não tiver observação customizada, tenta agrupar com um igual (sem obs)
      if (!observation) {
        const existing = prev.find((item) => item.product.id === product.id && !item.observation);
        if (existing) {
          return prev.map((item) => item.product.id === product.id && !item.observation ? { ...item, quantity: item.quantity + quantity } : item);
        }
      }
      // Sempre criar nova linha se tiver observação, ou se for novo
      return [...prev, { id: Math.random().toString(36).substring(7), product, quantity, observation }];
    });
    setShowModal(null);
  };

  const removeFromCart = (cartId: string) => {
    setCart((prev) => prev.filter(item => item.id !== cartId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const filterProducts = activeCategory === 'Todos' ? products : products.filter(p => p.category === activeCategory);

  const [isSaving, setIsSaving] = useState(false);

  const confirmOrder = async () => {
    setIsSaving(true);
    try {
      const deliveryString = deliveryMethod === 'home' 
        ? `Entrega: ${endRua}, ${endNumero} (CEP: ${cep}) - A/C: ${endAC} | Horário: ${endHorario}`
        : `Retirada: ${pickupDay}`;

      const itemsPayload = cart.map(c => ({
         name: c.product.title,
         qty: c.quantity,
         price: c.product.price,
         obs: c.observation
      }));

      const baseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      const payloadEmail = session.tokens?.idToken?.payload?.email as string;
      const payloadUsername = session.tokens?.idToken?.payload?.['cognito:username'] as string;
      const finalUserName = payloadEmail || payloadUsername || 'Membro do App';
      
      const res = await fetch(`${baseUrl}/pdv/orders`, {
         method: 'POST',
         headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           user_name: finalUserName,
           delivery_method: deliveryMethod,
           delivery_details: deliveryString,
           items_json: itemsPayload,
           total_price: cartTotal
         })
      });

      if (res.ok) {
        const { id } = await res.json();
        const newOrder = {
          id: id.substring(0, 8).toUpperCase(),
          date: new Date().toLocaleDateString('pt-BR'),
          status: 'RECEBIDO E PREPARANDO',
          total: cartTotal,
          items: cartItemCount,
          itemsDetail: itemsPayload,
          delivery: deliveryString
        };
        setOrders([newOrder, ...orders]);
        
        // Limpar sacola e estados...
        setCart([]);
        setDeliveryMethod('church');
        setPickupDay(null);
        setCep(''); setEndRua(''); setEndNumero(''); setEndAC(''); setEndHorario('');
        setCurrentView('success');
      } else {
        alert("Erro ao processar o seu pedido. Tente novamente.");
      }
    } catch(e) {
       console.log(e);
       alert("Erro de comunicação com servidor.");
    } finally {
       setIsSaving(false);
    }
  };

  const renderHeader = (title: string, backAction: () => void, rightAction?: React.ReactNode) => (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <TouchableOpacity onPress={backAction} style={styles.headerBtn}>
        <Feather name="arrow-left" size={24} color={textColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: textColor }]}>{title}</Text>
      <View style={styles.headerBtn}>
        {rightAction}
      </View>
    </View>
  );

  if (currentView === 'catalog') {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
          {renderHeader('Loja da Igreja', () => router.back(), (
            <TouchableOpacity onPress={() => setCurrentView('orders')}>
              <Feather name="list" size={24} color={textColor} />
            </TouchableOpacity>
          ))}
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Categories */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
              {dynamicCats.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.catBadge, { backgroundColor: activeCategory === cat ? primaryBrand : cardColor }]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.catText, { color: activeCategory === cat ? '#FFF' : textColor }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.productGrid}>
              {filterProducts.map(product => {
                const photo = (Array.isArray(product.image_urls) && product.image_urls.length > 0) ? product.image_urls[0] : null;
                const cartQty = cart.filter(c => c.product.id === product.id).reduce((sum, c) => sum + c.quantity, 0);

                return (
                  <TouchableOpacity 
                    key={product.id} 
                    style={[styles.productCard, { backgroundColor: cardColor, borderColor: cartQty > 0 ? primaryBrand : 'transparent', borderWidth: cartQty > 0 ? 2 : 0 }]}
                    activeOpacity={0.8}
                    onPress={() => addToCart(product)}
                    onLongPress={() => {
                      setQtdSelect(1);
                      setObsText('');
                      setShowModal(product);
                    }}
                    delayLongPress={400}
                  >
                    
                    {/* Badge Indicador de Seleção */}
                    {cartQty > 0 && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>{cartQty}</Text>
                      </View>
                    )}

                    {photo ? (
                      <Image source={{ uri: photo }} style={styles.productImage} />
                    ) : (
                      <View style={[styles.productImage, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Feather name="image" size={32} color={borderColor} />
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={[styles.productCategory, { color: primaryBrand }]}>{product.category}</Text>
                      <Text style={[styles.productTitle, { color: textColor }]} numberOfLines={2}>{product.title}</Text>
                      <Text style={[styles.productPrice, { color: textColor }]}>{formatPrice(product.price)}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

          </ScrollView>

          {/* Floating Cart Panel */}
          {cartItemCount > 0 && (
            <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
              <View>
                <Text style={[styles.cartTotalLabel, { color: textMuted }]}>{cartItemCount} item{cartItemCount > 1 && 's'}</Text>
                <Text style={[styles.cartTotalValue, { color: textColor }]}>{formatPrice(cartTotal)}</Text>
              </View>
              <TouchableOpacity style={styles.checkoutBtn} onPress={() => setCurrentView('cart')}>
                <Text style={styles.checkoutBtnText}>Ver Carrinho</Text>
                <Feather name="shopping-bag" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* Modal de Observação via LongPress */}
          <Modal visible={!!showModal} animationType="fade" transparent={true}>
            <View style={styles.modalBg}>
               <View style={[styles.modalBox, { backgroundColor: cardColor }]}>
                  {showModal && (
                    <>
                      <Text style={[styles.modalTitle, { color: textColor }]}>{showModal.title}</Text>
                      <Text style={{ fontSize: 16, color: primaryBrand, fontWeight: '800', marginBottom: 24 }}>{formatPrice(showModal.price)}</Text>

                      <Text style={[styles.inputLabel, { color: textMuted }]}>Quantidade Desejada</Text>
                      <View style={styles.stepperContainer}>
                         <TouchableOpacity style={[styles.stepperBtn, { backgroundColor: bgColor }]} onPress={() => setQtdSelect(Math.max(1, (Number(qtdSelect) || 1) - 1))}>
                            <Feather name="minus" size={20} color={textColor} />
                         </TouchableOpacity>
                         
                         <TextInput 
                           style={[styles.stepperValueInput, { color: textColor, backgroundColor: isDark ? '#1a2130' : '#f0f0f0' }]}
                           keyboardType="numeric"
                           maxLength={4}
                           value={String(qtdSelect)}
                           onChangeText={(val) => {
                             const num = parseInt(val.replace(/[^0-9]/g, ''), 10);
                             setQtdSelect(isNaN(num) ? '' : num);
                           }}
                         />

                         <TouchableOpacity style={[styles.stepperBtn, { backgroundColor: primaryBrand }]} onPress={() => setQtdSelect((Number(qtdSelect) || 0) + 1)}>
                            <Feather name="plus" size={20} color="#FFF" />
                         </TouchableOpacity>
                      </View>

                      <Text style={[styles.inputLabel, { color: textMuted }]}>Observações Gerais (Opcional)</Text>
                      <TextInput 
                        style={[styles.modalInput, { color: textColor, borderColor, backgroundColor: bgColor, minHeight: 80 }]}
                        placeholder="Ex: Embalar para presente, cor específica..."
                        placeholderTextColor={textMuted}
                        multiline={true}
                        value={obsText}
                        onChangeText={setObsText}
                      />

                      <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: bgColor, flex: 1 }]} onPress={() => setShowModal(null)}>
                           <Text style={{ color: textColor, fontWeight: '600' }}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: primaryBrand, flex: 2 }]} onPress={() => addToCart(showModal, Number(qtdSelect) || 1, obsText)}>
                           <Text style={{ color: '#FFF', fontWeight: '800' }}>Adicionar</Text>
                           <Feather name="plus" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
               </View>
            </View>
          </Modal>
        </SafeAreaView>
      </>
    );
  }

  if (currentView === 'cart') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Meu Carrinho', () => setCurrentView('catalog'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {cart.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 100 }}>
               <Feather name="shopping-cart" size={48} color={textMuted} />
               <Text style={{ color: textMuted, marginTop: 16 }}>Seu carrinho está vazio.</Text>
             </View>
          ) : (
             <>
                {cart.map(item => (
                  <View key={item.product.id} style={[styles.cartItem, { backgroundColor: cardColor }]}>
                    {Array.isArray(item.product.image_urls) && item.product.image_urls[0] ? (
                      <Image source={{ uri: item.product.image_urls[0] }} style={styles.cartItemImg} />
                    ) : (
                      <View style={[styles.cartItemImg, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Feather name="image" size={20} color={borderColor} />
                      </View>
                    )}
                    <View style={styles.cartItemInfo}>
                      <Text style={[styles.cartItemTitle, { color: textColor }]} numberOfLines={2}>{item.product.title}</Text>
                      {!!item.observation && <Text style={{ color: '#FF9500', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>Obs: {item.observation}</Text>}
                      <Text style={[styles.cartItemPrice, { color: textColor }]}>{formatPrice(item.product.price)}</Text>
                      <Text style={[styles.cartItemQty, { color: textMuted }]}>Qtd: {item.quantity}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                      <Feather name="trash-2" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                ))}
             </>
          )}
        </ScrollView>
        {cartItemCount > 0 && (
          <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
            <View>
              <Text style={[styles.cartTotalLabel, { color: textMuted }]}>Total da Compra</Text>
              <Text style={[styles.cartTotalValue, { color: textColor }]}>{formatPrice(cartTotal)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={() => setCurrentView('checkout')}>
              <Text style={styles.checkoutBtnText}>Continuar</Text>
              <Feather name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (currentView === 'checkout') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Finalizar Compra', () => setCurrentView('cart'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Text style={[styles.sectionTitle, { color: textColor }]}>Como deseja receber?</Text>
          <View style={styles.deliveryOptions}>
            <TouchableOpacity 
              style={[styles.deliveryOpt, { backgroundColor: cardColor, borderColor: deliveryMethod === 'church' ? primaryBrand : borderColor }]}
              onPress={() => setDeliveryMethod('church')}
            >
              <Feather name="map-pin" size={24} color={deliveryMethod === 'church' ? primaryBrand : textMuted} />
              <Text style={[styles.deliveryOptText, { color: textColor }]}>Retirar na Igreja</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.deliveryOpt, { backgroundColor: cardColor, borderColor: deliveryMethod === 'home' ? primaryBrand : borderColor }]}
              onPress={() => setDeliveryMethod('home')}
            >
              <Feather name="truck" size={24} color={deliveryMethod === 'home' ? primaryBrand : textMuted} />
              <Text style={[styles.deliveryOptText, { color: textColor }]}>Receber em Casa</Text>
            </TouchableOpacity>
          </View>

          {deliveryMethod === 'church' && (
            <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
              <Text style={[styles.subpanelTitle, { color: textColor }]}>Onde você vai retirar?</Text>
              <TouchableOpacity onPress={() => setPickupDay('Retirar no Balcão / Ponto de Coleta')} style={[styles.radioItem, { backgroundColor: pickupDay === 'Retirar no Balcão / Ponto de Coleta' ? `${primaryBrand}15` : 'transparent' }]}>
                <Feather name={pickupDay === 'Retirar no Balcão / Ponto de Coleta' ? 'check-circle' : 'circle'} size={20} color={pickupDay === 'Retirar no Balcão / Ponto de Coleta' ? primaryBrand : textMuted} />
                <Text style={{ marginLeft: 12, color: textColor, fontWeight: '600' }}>Retirar no Balcão / Ponto de Coleta</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setPickupDay('Retirar ao Final do Culto')} style={[styles.radioItem, { backgroundColor: pickupDay === 'Retirar ao Final do Culto' ? `${primaryBrand}15` : 'transparent' }]}>
                <Feather name={pickupDay === 'Retirar ao Final do Culto' ? 'check-circle' : 'circle'} size={20} color={pickupDay === 'Retirar ao Final do Culto' ? primaryBrand : textMuted} />
                <Text style={{ marginLeft: 12, color: textColor, fontWeight: '600' }}>Retirar ao Final do Culto</Text>
              </TouchableOpacity>
            </View>
          )}

          {deliveryMethod === 'home' && (
            <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
              <Text style={[styles.subpanelTitle, { color: textColor }]}>Endereço de Entrega</Text>
              
              <Text style={[styles.inputLabel, { color: textMuted, marginTop: 8 }]}>CEP</Text>
              <TextInput style={[styles.inputForm, { borderColor, color: textColor, backgroundColor: bgColor }]} placeholder="00000-000" placeholderTextColor={textMuted} value={cep} onChangeText={setCep} keyboardType="numeric" />
              
              <Text style={[styles.inputLabel, { color: textMuted, marginTop: 12 }]}>Rua / Endereço</Text>
              <TextInput style={[styles.inputForm, { borderColor, color: textColor, backgroundColor: bgColor }]} placeholder="Nome da rua..." placeholderTextColor={textMuted} value={endRua} onChangeText={setEndRua} />
              
              <Text style={[styles.inputLabel, { color: textMuted, marginTop: 12 }]}>Número e Complemento</Text>
              <TextInput style={[styles.inputForm, { borderColor, color: textColor, backgroundColor: bgColor }]} placeholder="Ex: 123, Apto 4" placeholderTextColor={textMuted} value={endNumero} onChangeText={setEndNumero} />
              
              <Text style={[styles.inputLabel, { color: textMuted, marginTop: 12 }]}>A/C (Aos cuidados de)</Text>
              <TextInput style={[styles.inputForm, { borderColor, color: textColor, backgroundColor: bgColor }]} placeholder="Quem vai receber?" placeholderTextColor={textMuted} value={endAC} onChangeText={setEndAC} />
              
              <Text style={[styles.inputLabel, { color: textMuted, marginTop: 12 }]}>Preferência de Horário</Text>
              <TextInput style={[styles.inputForm, { borderColor, color: textColor, backgroundColor: bgColor }]} placeholder="Ex: Manhã, ou Após as 18h" placeholderTextColor={textMuted} value={endHorario} onChangeText={setEndHorario} />

              <Text style={{ color: textMuted, fontSize: 12, marginTop: 16 }}>Taxas de entrega e link de pagamento serão enviados via WhatsApp após confirmação.</Text>
            </View>
          )}

        </ScrollView>

        {/* Action button appears once conditions are met */}
        {((deliveryMethod === 'home' && endRua && endNumero) || (deliveryMethod === 'church' && pickupDay)) && (
          <View style={[styles.floatingCart, { backgroundColor: cardColor, borderTopColor: borderColor }]}>
            <TouchableOpacity style={[styles.checkoutBtn, { flex: 1, backgroundColor: primaryBrand, justifyContent: 'center' }]} onPress={confirmOrder} disabled={isSaving}>
              <Text style={styles.checkoutBtnText}>{isSaving ? 'Enviando...' : 'Enviar Pedido para a Igreja'}</Text>
              {!isSaving && <Feather name="send" size={18} color="#FFF" style={{ marginLeft: 8 }} />}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  if (currentView === 'success') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,196,100,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
          <Feather name="check" size={48} color="#00C464" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '900', color: textColor, marginBottom: 8, textAlign: 'center' }}>Pedido Confirmado!</Text>
        <Text style={{ fontSize: 16, color: textMuted, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20 }}>
          Seu pedido foi recebido com sucesso e estamos preparando tudo com carinho. Acompanhe o status de preparo.
        </Text>
        
        <TouchableOpacity 
          style={{ backgroundColor: primaryBrand, paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center', marginBottom: 16 }}
          onPress={() => setCurrentView('orders')}
        >
          <Text style={{ color: '#FFF', fontSize: 16, fontWeight: '800' }}>Ver Meus Pedidos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={{ paddingHorizontal: 32, paddingVertical: 18, borderRadius: 30, width: '100%', alignItems: 'center' }}
          onPress={() => setCurrentView('catalog')}
        >
          <Text style={{ color: textMuted, fontSize: 16, fontWeight: '700' }}>Voltar para a Loja</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (currentView === 'orders') {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader('Meus Pedidos', () => setCurrentView('catalog'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {orders.map(order => (
            <TouchableOpacity key={order.id} style={[styles.orderCard, { backgroundColor: cardColor }]} onPress={() => { setSelectedOrder(order); setCurrentView('orderDetail'); }} activeOpacity={0.8}>
              <View style={styles.orderHeader}>
                 <Text style={[styles.orderId, { color: textColor }]}>Pedido #{order.id}</Text>
                 <View style={[styles.orderStatusBadge, { backgroundColor: order.status === 'ENTREGUE' ? '#00C46415' : 'rgba(255, 149, 0, 0.1)' }]}>
                   <Text style={{ color: order.status === 'ENTREGUE' ? '#00C464' : '#FF9500', fontWeight: '800', fontSize: 10 }}>{order.status}</Text>
                 </View>
              </View>
              <View style={styles.orderFooter}>
                 <Text style={[styles.orderInfo, { color: textMuted }]}>{order.date} • {order.items} itens</Text>
                 <Text style={[styles.orderTotal, { color: textColor }]}>{formatPrice(order.total)}</Text>
              </View>
              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: borderColor, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                <Text style={{ color: primaryBrand, fontWeight: '700', fontSize: 13, marginRight: 8 }}>Ver Detalhes do Pedido</Text>
                <Feather name="chevron-right" size={16} color={primaryBrand} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (currentView === 'orderDetail' && selectedOrder) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
        {renderHeader(`Detalhes #${selectedOrder.id}`, () => setCurrentView('orders'))}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[styles.subpanel, { backgroundColor: cardColor, borderColor }]}>
            <Text style={[styles.subpanelTitle, { color: textColor }]}>Status Atual</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Feather name="package" size={24} color={selectedOrder.status === 'ENTREGUE' ? '#00C464' : '#FF9500'} />
              <Text style={{ marginLeft: 12, color: textColor, fontWeight: '700', fontSize: 16 }}>{selectedOrder.status}</Text>
            </View>
            <Text style={{ color: textMuted, marginTop: 12, fontSize: 13 }}>Método de Recebimento: {selectedOrder.delivery}</Text>
          </View>

          <Text style={[styles.sectionTitle, { color: textColor, marginTop: 16 }]}>Itens Comprados</Text>
          <View style={[styles.listContainer, { backgroundColor: cardColor }]}>
             {selectedOrder.itemsDetail.map((itm: any, idx: number) => (
                <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: idx === selectedOrder.itemsDetail.length - 1 ? 0 : 1, borderBottomColor: borderColor }}>
                     <View style={{ flex: 1, marginRight: 16 }}>
                       <Text style={{ color: textColor, fontWeight: '600' }}>{itm.qty}x {itm.name}</Text>
                       {!!itm.obs && <Text style={{ color: '#FF9500', fontSize: 12, marginTop: 4 }}>Obs: {itm.obs}</Text>}
                     </View>
                   <Text style={{ color: textColor, fontWeight: '800' }}>{formatPrice(itm.price * itm.qty)}</Text>
                </View>
             ))}
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                <Text style={{ color: textMuted, fontWeight: '600' }}>Total Pago Via PIX</Text>
                <Text style={{ color: primaryBrand, fontWeight: '900', fontSize: 18 }}>{formatPrice(selectedOrder.total)}</Text>
             </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 16, borderBottomWidth: 1 },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Catalog
  catScroll: { flexDirection: 'row', marginBottom: 24, maxHeight: 40 },
  catBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 12, justifyContent: 'center', height: 38 },
  catText: { fontSize: 14, fontWeight: '700' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 60 },
  productCard: { width: '48%', borderRadius: 16, overflow: 'hidden', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, position: 'relative' },
  productImage: { width: '100%', height: 160, backgroundColor: 'rgba(0,0,0,0.02)' },
  selectedBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#00C464', minWidth: 26, height: 26, paddingHorizontal: 6, borderRadius: 13, justifyContent: 'center', alignItems: 'center', zIndex: 10, shadowColor: '#00C464', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 5 },
  selectedBadgeText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
  productInfo: { padding: 12 },
  productCategory: { fontSize: 10, fontWeight: '800', marginBottom: 4, textTransform: 'uppercase' },
  productTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8, height: 40 },
  productPrice: { fontSize: 16, fontWeight: '900' },
  
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox: { margin: 24, padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 6 },
  stepperContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepperBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  stepperValueInput: { fontSize: 24, fontWeight: '900', marginHorizontal: 16, minWidth: 80, textAlign: 'center', borderRadius: 12, paddingVertical: 8 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#9BA1A6', textTransform: 'uppercase', marginBottom: 10 },
  modalInput: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, textAlignVertical: 'top' },
  actionBtn: { padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  
  // Floating Cart
  floatingCart: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartTotalLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  cartTotalValue: { fontSize: 22, fontWeight: '900' },
  checkoutBtn: { backgroundColor: '#5bc3bb', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  checkoutBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  // Cart Items
  cartItem: { flexDirection: 'row', padding: 16, borderRadius: 16, marginBottom: 16, alignItems: 'center' },
  cartItemImg: { width: 60, height: 60, borderRadius: 8, backgroundColor: '#EAEAEA', marginRight: 16 },
  cartItemInfo: { flex: 1 },
  cartItemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  cartItemPrice: { fontSize: 16, fontWeight: '900', marginBottom: 4 },
  cartItemQty: { fontSize: 12, fontWeight: '600' },
  
  // Checkout
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 16 },
  deliveryOptions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  deliveryOpt: { flex: 1, alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 2, marginHorizontal: 6 },
  deliveryOptText: { marginTop: 12, fontWeight: '700', fontSize: 14 },
  subpanel: { padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 24 },
  subpanelTitle: { fontSize: 15, fontWeight: '800', marginBottom: 16 },
  radioItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 16, minHeight: 80, fontSize: 15 },
  inputForm: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15 },
  
  pixCard: { padding: 24, borderRadius: 24, borderWidth: 1, alignItems: 'center' },
  qrCodeMock: { width: 150, height: 150, borderWidth: 2, borderStyle: 'dashed', borderColor: '#CCC', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  pixValue: { fontSize: 32, fontWeight: '900', marginTop: 16 },
  copyPixBtn: { backgroundColor: '#0a7ea4', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 30, width: '100%', justifyContent: 'center', marginBottom: 16 },
  validatePixBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderStyle: 'dashed', borderRadius: 30, width: '100%' },
  validatePixText: { fontWeight: '700', marginLeft: 8 },
  paidSuccess: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, backgroundColor: 'rgba(0,196,100,0.1)', borderRadius: 16, width: '100%' },
  
  // Orders
  orderCard: { padding: 20, borderRadius: 16, marginBottom: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { fontSize: 16, fontWeight: '800' },
  orderStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderInfo: { fontSize: 13, fontWeight: '600' },
  orderTotal: { fontSize: 18, fontWeight: '900' },
  listContainer: { borderRadius: 16, overflow: 'hidden' }
});
